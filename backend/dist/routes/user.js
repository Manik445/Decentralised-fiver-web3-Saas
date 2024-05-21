"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const express_1 = require("express");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = (0, express_1.Router)();
const prismaClient = new client_1.PrismaClient();
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const __1 = require("..");
const S3client = new S3Client();
const command = new GetObjectCommand({
    Bucket: "",
    key: ""
});
const presignedurl = getSignedUrl(S3client, command, { expiresIn: 3600 });
router.get('/test', (req, res) => {
    res.send("this is test file");
});
// router.get('/getpresignedurl' , authMiddleware , (req , req)=>{ // authmiddleware for verifying the token
// })
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const hardCodedWalletAddress = "hard-coded-wallet-address-like-phantom";
    // check if address is present already    
    const existingUser = yield prismaClient.user.findFirst({
        where: {
            address: hardCodedWalletAddress
        }
    });
    // if user is found 
    if (existingUser) {
        // return a jwt 
        const token = jsonwebtoken_1.default.sign({
            userId: existingUser.id // payload backend returns to frontend 
        }, __1.SECRET_KEY);
        res.json({
            token
        });
    }
    else {
        const user = yield prismaClient.user.create({
            data: {
                address: hardCodedWalletAddress
            }
        });
        const token = jsonwebtoken_1.default.sign({
            userid: user.id
        }, __1.SECRET_KEY);
        res.json({
            token
        });
    }
}));
exports.default = router;
