import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken"
const router = Router(); 
const prismaClient = new PrismaClient(); 
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { authMiddleware } from "../middlewares";
import { SECRET_KEY } from "..";  
import createTaksUrl from "./types";


const DEFAULT_TITLE = "select the most clickable images"


router.get('/test' , authMiddleware , async(req , res)=>{
    // @ts-ignore
    const taskId : string = req.query.taskId 
    // @ts-ignore 
    const userId : string = req.query.userId 

    const taskDetails = await prismaClient.user.findFirst({
        where: {
            // @ts-ignore
            user_id : Number(userId) , 
            id : Number(taskId)
        }
    })

    // returning res 
    const response = await prismaClient.user.findMany({
        where : {
            // @ts-ignore
            task_id : Number(taskId)
        }, 
        Includes : {
            task : true , 
            option : true 
        }
    })

    const result: Record<string, {
        count: number;
        option: {
            imageUrl: string
        }
    }> = {};
        // @ts-ignore
    taskDetails.options.forEach(option => {
        result[option.id] = {
            count: 0,
            option: {
                imageUrl: option.image_url
            }
        }
    })

    response.forEach(r => {
        // @ts-ignore
        result[r.option_id].count++;
    });

    res.json({
        result,
        taskDetails
    })

    if(!taskDetails){
        return res.status(411).json({
            message : "No task Details found "
        })
    }





})

router.get('/test' , (req , res)=>{
    res.send("this is test file")
})

// uploading objects in s3 bucket  // for providing creadintals
const S3client = new S3Client({

    credentials : {
        accessKeyId : "FANGLALAJAAW" , 
        secretAcessKey : "GALGLANGALNGALL" 
    },   
    region : "us-ease-1"  
});

prismaClient.$transaction(
    async (prisma) => {
      // Code running in a transaction...
    },
    {
      maxWait: 5000, // default: 2000
      timeout: 10000, // default: 5000
    }
)

router.post('/task' , authMiddleware , async(req , res)=>{
    // validata inputs given by user using zod 
    const data = req.body; 
    // @ts-ignore
    const userId = req.userId 
    const parseData = createTaksUrl.safeParse(data); 

    // if the input is not given as per zod config 
    if(!parseData){
        res.status(411).json({
            message : "invalid inputs given by user"
        })
    }    

    // parse the signature to ensure that person paid $x
    // @ts-ignore
  let response = await  PrismaClient.$transaction(async tx => {
        // creating tasks  
        const response = await tx.task.create({     
            data : {
                title : parseData.data?.title ?? DEFAULT_TITLE , 
                user_id : userId , 
                amount : "1" , 
                signature : parseData.data?.signature 
            }
        })
            // creating options for tasks
        await tx.option.createMany({
            data : parseData.data?.options.map(x =>({
                imageurl : x.imageUrl , 
                taskid : response.id
            }))
        })

        console.log(parseData.data?.options.map(x => ({
            image_url : x.imageUrl , 
            title_id : response.id 
        })))
            
        return response ; 
    })
    res.json({
        id : response.id 
    })
})

// provide jwt token in header : while generting presignedurl 
router.get("/presignedUrl", authMiddleware, async (req, res) => {
    // @ts-ignore
    const userId = req.userId;

    const { url, fields } = await createPresignedPost(S3client, {
        Bucket: 'manik-cms',
        Key: `fiver/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
          ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
        ],
        Expires: 3600
    })

    res.json({
        preSignedUrl: url,
        fields // returning fields for frontend use 
    })
    
})

router.post('/signin' , async(req , res)=>{
    const hardCodedWalletAddress = "hard-coded-wallet-address-like-phantom"

    // check if address is present already    
    const existingUser = await prismaClient.user.findFirst({
        where : {
            address : hardCodedWalletAddress
        }
    })
        // if user is found 
    if(existingUser){
        // return a jwt 
        const token = jwt.sign({
                userId : existingUser.id  // payload backend returns to frontend 
        } , SECRET_KEY)
        res.json({ // return jwt token
            token 
        })
    }else { 
        const user = await prismaClient.user.create({
            data : {
                address : hardCodedWalletAddress
            }
        })
        const token = jwt.sign({
            userid : user.id
        } , SECRET_KEY)
        res.json({
            token
        })
    }
})


   
export default router; 

