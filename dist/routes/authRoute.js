"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_js_1 = require("../controllers/authController.js");
const authController_js_2 = require("../controllers/authController.js");
const authRouter = (0, express_1.Router)();
authRouter.route("/sign-up").post(authController_js_2.signUp);
authRouter.route("/login").post(authController_js_2.login);
authRouter.route("/forgot-password").post(authController_js_2.forgotPassord);
authRouter.route("/reset-password:token").post(authController_js_2.resetPassword);
authRouter
    .route("/validate-reset-token:token")
    .post(authController_js_2.validatePasswordResetToken);
authRouter.route("/add-business").post(authController_js_1.addBusiness);
exports.default = authRouter;
