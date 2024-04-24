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
exports.getSingleUser = void 0;
const User_js_1 = __importDefault(require("../Models/User.js"));
const http_status_codes_1 = require("http-status-codes");
const jwt_js_1 = require("../utils/jwt.js");
const getSingleUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.params.id;
    try {
        //extract token from cookies
        const token = req.cookies.jwt;
        //verify the token
        const decodedToken = (0, jwt_js_1.isTokenValid)(token);
        console.log("my decoded token", decodedToken);
        if (decodedToken.id !== id) {
            return res.status(http_status_codes_1.StatusCodes.UNAUTHORIZED).json({ message: "Unauthorized access" });
        }
        const user = yield User_js_1.default.findById(id);
        if (!user) {
            // Send 404 Not Found if user is not found
            return res
                .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                .json({ message: "User not found" });
        }
        // Populate the 'businesses' field
        const populatedUser = yield User_js_1.default.findById(id).populate("businesses");
        // Send the populated user object
        res.status(http_status_codes_1.StatusCodes.OK).json({
            user: populatedUser,
        });
    }
    catch (error) {
        console.error(error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ message: "Oops there was an error" });
    }
});
exports.getSingleUser = getSingleUser;
