import { SECRET_KEY } from ".";
import { NextFunction , Request , Response } from "express";
import jwt from 'jsonwebtoken'

export function authMiddleware(req : Request , res : Response , next : NextFunction){
    const authheader = req.header("authorization") ?? ""

    try {
        const decode = jwt.verify(authheader , SECRET_KEY);
        // @ts-ignore 
        if(decode.userId){
            // @ts-ignore
            req.userId = decode.userId
            return next()
        }
        else{
            return res.status(403).json({
                message : "you are not logged in"
            })
        }
    }
    catch(e){
        return res.status(403).json({
            message : "User not Verified"
        })        
    }
} 



