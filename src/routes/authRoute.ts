import { Router } from "express";
import { login, signUp } from "../controllers/authController.js";
import { forgotPassord } from "../controllers/authController.js";
import { resetPassword } from "../controllers/authController.js";

const authRouter = Router();

authRouter.route("/signUp").post(signUp);
authRouter.route("/login").post(login);
authRouter.route("/forgotPassword").post(forgotPassord);
authRouter.route("/resetPassword:").post(resetPassword);


export default authRouter;
