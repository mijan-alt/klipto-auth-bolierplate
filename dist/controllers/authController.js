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
exports.logout = exports.resetPassword = exports.validatePasswordResetToken = exports.forgotPassord = exports.login = exports.addBusiness = exports.signUp = void 0;
const User_js_1 = __importDefault(require("../Models/User.js"));
const http_status_codes_1 = require("http-status-codes");
const jwt_js_1 = require("../utils/jwt.js");
const dotenv_1 = require("dotenv");
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const sendEmail_js_1 = require("../utils/sendEmail.js");
const crypto_1 = __importDefault(require("crypto"));
const Business_js_1 = require("../Models/Business.js");
const BadRequest_js_1 = __importDefault(require("../errors/BadRequest.js"));
(0, dotenv_1.config)();
const localUrl = process.env.BASE_SERVER_URL;
const clientUrl = process.env.CLIENT_URL;
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password, username } = req.body;
    try {
        const user = yield User_js_1.default.findOne({ email });
        if (user) {
            throw new Error("Email Already Exist");
        }
        const userData = new User_js_1.default({
            email,
            password,
            username,
        });
        // Save the user data to the database
        const newUser = yield userData.save();
        const maxAge = 90 * 24 * 60 * 60 * 1000;
        const token = (0, jwt_js_1.createJWT)(newUser._id, maxAge);
        console.log("my token", token);
        res.cookie("jwt", token, { httpOnly: true }); //store the token in a cookie but make it available only on the server
        // res.status(StatusCodes.OK).json({message:"Complete"})
        res.redirect(`http://localhost:3000/addBusiness?userId=${newUser._id}`);
    }
    catch (error) {
        console.log(error);
    }
});
exports.signUp = signUp;
const addBusiness = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { businessName, businessEmail, businessCategory, businessBio } = req.body;
    const userId = req.query.userId; //Get the userId from thre query parameters
    try {
        //find the user by Id
        const user = yield User_js_1.default.findById(userId);
        if (!user) {
            return res
                .status(http_status_codes_1.StatusCodes.NOT_FOUND)
                .json({ message: "User not found" });
        }
        const businessData = {
            businessName,
            businessEmail,
            businessCategory,
            businessBio,
            userId: userId,
        };
        //create a new business
        const newBusiness = new Business_js_1.Business(businessData);
        yield newBusiness.save();
        if (user.businesses.length >= 3) {
            return res.status(400).json({
                message: "User already has the maximum number of businesses (3).",
            });
        }
        user.businesses.push(newBusiness._id);
        yield user.save();
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Account signed in succesffuly",
            user,
        });
        console.log("my createad business");
    }
    catch (error) {
        console.log(error);
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: "Something went wrong" });
    }
});
exports.addBusiness = addBusiness;
const login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield User_js_1.default.findOne({ email });
        if (!user) {
            res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: "User not found" });
        }
        const isPasswordCorrect = yield user.comparePassword(password);
        if (!isPasswordCorrect) {
            throw new BadRequest_js_1.default("Invalid Credentails");
        }
        const maxAge = 90 * 24 * 60 * 60 * 1000;
        const token = (0, jwt_js_1.createJWT)(user._id, maxAge);
        res.cookie('jwt', token, { httpOnly: true });
        res.status(http_status_codes_1.StatusCodes.OK).json({
            message: "Account signed in succesffuly",
            user,
        });
    }
    catch (error) {
        res.status(401).json({ error: "Could not sign in" });
    }
});
exports.login = login;
const forgotPassord = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const user = yield User_js_1.default.findOne({ email });
    if (!user) {
        console.log("User does not exit");
        res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }
    const resetToken = user.createResetPasswordToken();
    console.log("my reset token", resetToken);
    // save the encrypted token in the data base
    yield user.save();
    console.log(resetToken);
    const resetUrl = `${localUrl}/api/v1/users/resetPassword/${resetToken}`;
    const templatePath = path_1.default.join(__dirname, "../views/forgotpassword.ejs");
    const renderHtml = yield ejs_1.default.renderFile(templatePath, {
        userFullname: user.fullname,
        userEmail: user.email,
        userRecoveryUrl: resetUrl,
    }, { async: true });
    try {
        yield (0, sendEmail_js_1.sendMails)({
            email: user.email,
            subject: "Password Recovery",
            html: renderHtml,
        });
        res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "Password reset link has been sent to your email" });
    }
    catch (error) {
        //  in the event of an unfuufllied promise , we want to set the reset tokens to undefined
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpire = undefined;
        //then we save these new values to the database
        user.save();
        res.status(http_status_codes_1.StatusCodes.REQUEST_TIMEOUT).json({
            message: "There was an error sending password reset email. Try again",
        });
    }
});
exports.forgotPassord = forgotPassord;
const validatePasswordResetToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    try {
        // Encrypt the incoming token
        const encryptedToken = crypto_1.default
            .createHash("sha256")
            .update(token)
            .digest("hex");
        // Find the user whose passwordResetToken matches the encrypted token
        const user = yield User_js_1.default.findOne({
            passwordResetToken: encryptedToken,
            passwordResetTokenExpire: { $gt: Date.now() },
        });
        if (!user) {
            return res
                .status(http_status_codes_1.StatusCodes.NON_AUTHORITATIVE_INFORMATION)
                .json({ message: "Token is invalid or expired" });
        }
        // If token is valid, redirect to client-side password reset form
        const clientURL = process.env.CLIENT_URL;
        return res.redirect(`${clientURL}/reset-password/${token}`);
    }
    catch (error) {
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: "Error verifying password reset token" });
    }
});
exports.validatePasswordResetToken = validatePasswordResetToken;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const { newPassword } = req.body;
    try {
        if (!newPassword) {
            return res
                .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
                .json({ error: "New password is required" });
        }
        // Encrypt the incoming token
        const encryptedToken = crypto_1.default
            .createHash("sha256")
            .update(token)
            .digest("hex");
        // Find the user whose passwordResetToken matches the encrypted token
        const user = yield User_js_1.default.findOne({
            passwordResetToken: encryptedToken,
            passwordResetTokenExpire: { $gt: Date.now() },
        });
        if (!user) {
            return res
                .status(http_status_codes_1.StatusCodes.NON_AUTHORITATIVE_INFORMATION)
                .json({ message: "Token is invalid or expired" });
        }
        // Update user's password
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetTokenExpire = undefined;
        // save the updated information to db
        yield user.save();
        return res
            .status(http_status_codes_1.StatusCodes.OK)
            .json({ message: "Password reset successful" });
    }
    catch (error) {
        res
            .status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR)
            .json({ error: "Error resetting password" });
    }
});
exports.resetPassword = resetPassword;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        res.clearCookie('jwt');
        res.status(http_status_codes_1.StatusCodes.OK).json({ message: 'User signed out succesffuy' });
    }
    catch (error) {
        return res.status(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR).json({ mesage: "Oops, there was an error signing out" });
    }
});
exports.logout = logout;
