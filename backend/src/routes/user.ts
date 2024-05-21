import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken"
const router = Router(); 
const prismaClient = new PrismaClient(); 
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
import { authMiddleware } from "../middlewares";
import { SECRET_KEY } from "..";  

// uploading objects in s3 bucket  // for providing creadintals
const S3client = new S3Client({
    credentials : {
        accessKeyId : "" , 
        secretAcessKey : ""
    }   
});


router.get('/test' , (req , res)=>{
    res.send("this is test file")
})
// provide jwt token in header : while generting presignedurl 
router.get('/getpresignedurl' , authMiddleware , (req , res)=>{ // authmiddleware for verifying the token
     // @ts-ignore
    const userId = req.userId; 
    const command = new GetObjectCommand({  
        Bucket : "name-of-s3-bucket" , 
        key : `/example/${userId}/${Math.random()}/image.jpg`  // /image.jpg is an location of the folder
    });

    const presignedurl = getSignedUrl(S3client, command , { expiresIn: 3600 });
    
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
        res.json({
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

