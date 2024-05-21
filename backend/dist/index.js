"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SECRET_KEY = void 0;
const express = require('express');
const app = express();
const port = 2000;
const user_1 = __importDefault(require("./routes/user"));
const worker_1 = __importDefault(require("./routes/worker"));
exports.SECRET_KEY = 'manikGuptaJwtsecretkey';
// middlewares for user and workers (signin : using wallets4) 
app.use('/v1/user', user_1.default);
app.use('/v1/worker', worker_1.default);
app.listen(port, () => {
    console.log(`server is listening at ${port}`);
});
