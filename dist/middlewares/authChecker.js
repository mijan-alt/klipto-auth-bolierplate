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
exports.authenticateUser = void 0;
const jwt_js_1 = require("../utils/jwt.js");
const UnAuthenticated_js_1 = __importDefault(require("../errors/UnAuthenticated.js"));
const User_js_1 = __importDefault(require("../Models/User.js"));
const authenticateUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let token;
    // check header
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader.startsWith("Bearer ")) {
        throw new UnAuthenticated_js_1.default("Authentication Token is missing");
    }
    console.log("my auth header", authHeader);
    token = authHeader === null || authHeader === void 0 ? void 0 : authHeader.split(" ")[1];
    console.log("my token", token);
    if (!token) {
        throw new UnAuthenticated_js_1.default("Authentication is invalid");
    }
    try {
        const payload = (0, jwt_js_1.isTokenValid)(token); //get the decoded token
        const user = yield User_js_1.default.findById(payload._id);
        if (!user) {
            throw new UnAuthenticated_js_1.default("User not found");
        }
        next();
    }
    catch (error) {
        throw new UnAuthenticated_js_1.default("Authentication is invalid");
    }
});
exports.authenticateUser = authenticateUser;
