import { Router } from "express";


import {
    login,
    signUp,
forgotPassord, 
 validatePasswordResetToken,
  resetPassword,
} from "../controllers/authController.js";

const authRouter = Router();

authRouter.route("/sign-up").post(signUp);
authRouter.route("/login").post(login);
authRouter.route("/forgot-password").post(forgotPassord);
authRouter.route("/reset-password:token").post(resetPassword);
authRouter
  .route("/validate-reset-token:token")
  .post(validatePasswordResetToken);


export default authRouter;
