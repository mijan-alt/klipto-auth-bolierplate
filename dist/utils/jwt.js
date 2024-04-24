"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTokenValid = exports.createJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const createJWT = (id, maxAge) => {
    return jsonwebtoken_1.default.sign({ id }, `${process.env.JWT_SECRET}`, {
        expiresIn: maxAge,
    });
};
exports.createJWT = createJWT;
const isTokenValid = (token) => jsonwebtoken_1.default.verify(token, `${process.env.JWT_SECRET}`);
exports.isTokenValid = isTokenValid;
