import { Router } from "express";
import { addBusiness } from "../controllers/authController.js";


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
authRouter.route("/add-business").post(addBusiness);



export default authRouter;
