"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const _1 = require(".");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function authMiddleware(req, res, next) {
    var _a;
    const authheader = (_a = req.header("authorization")) !== null && _a !== void 0 ? _a : "";
    try {
        const decode = jsonwebtoken_1.default.verify(authheader, _1.SECRET_KEY);
        // @ts-ignore 
        if (decode.userId) {
            // @ts-ignore
            req.userId = decode.userId;
            return next();
        }
        else {
            return res.status(403).json({
                message: "you are not logged in"
            });
        }
    }
    catch (e) {
        return res.status(403).json({
            message: "User not Verified"
        });
    }
}
exports.authMiddleware = authMiddleware;
