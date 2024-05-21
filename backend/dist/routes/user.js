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
const s3_presigned_post_1 = require("@aws-sdk/s3-presigned-post");
const middlewares_1 = require("../middlewares");
const __1 = require("..");
const types_1 = __importDefault(require("./types"));
const DEFAULT_TITLE = "select the most clickable images";
router.get('/test', (req, res) => {
    res.send("this is test file");
});
// uploading objects in s3 bucket  // for providing creadintals
const S3client = new S3Client({
    credentials: {
        accessKeyId: "FANGLALAJAAW",
        secretAcessKey: "GALGLANGALNGALL"
    },
    region: "us-ease-1"
});
prismaClient.$transaction((prisma) => __awaiter(void 0, void 0, void 0, function* () {
    // Code running in a transaction...
}), {
    maxWait: 5000, // default: 2000
    timeout: 10000, // default: 5000
});
router.post('/task', middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // validata inputs given by user using zod 
    const data = req.body;
    // @ts-ignore
    const userId = req.userId;
    const parseData = types_1.default.safeParse(data);
    // if the input is not given as per zod config 
    if (!parseData) {
        res.status(411).json({
            message: "invalid inputs given by user"
        });
    }
    // parse the signature to ensure that person paid $x
    // @ts-ignore
    let response = yield client_1.PrismaClient.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        // creating tasks  
        const response = yield tx.task.create({
            data: {
                title: (_b = (_a = parseData.data) === null || _a === void 0 ? void 0 : _a.title) !== null && _b !== void 0 ? _b : DEFAULT_TITLE,
                user_id: userId,
                amount: "1",
                signature: (_c = parseData.data) === null || _c === void 0 ? void 0 : _c.signature
            }
        });
        // creating options for tasks
        yield tx.option.createMany({
            data: (_d = parseData.data) === null || _d === void 0 ? void 0 : _d.options.map(x => ({
                imageurl: x.imageUrl,
                taskid: response.id
            }))
        });
        console.log((_e = parseData.data) === null || _e === void 0 ? void 0 : _e.options.map(x => ({
            image_url: x.imageUrl,
            title_id: response.id
        })));
        return response;
    }));
    res.json({
        id: response.id
    });
    // create new task : inputs validated
    // prismaClient.task.create({
    //     data : {
    //         title : parseData.data?.title ?? DEFAULT_TITLE
    //     }
    // })
}));
// provide jwt token in header : while generting presignedurl 
router.get("/presignedUrl", middlewares_1.authMiddleware, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // @ts-ignore
    const userId = req.userId;
    const { url, fields } = yield (0, s3_presigned_post_1.createPresignedPost)(S3client, {
        Bucket: 'manik-cms',
        Key: `fiver/${userId}/${Math.random()}/image.jpg`,
        Conditions: [
            ['content-length-range', 0, 5 * 1024 * 1024] // 5 MB max
        ],
        Expires: 3600
    });
    res.json({
        preSignedUrl: url,
        fields // returning fields for frontend use 
    });
}));
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
