import { Router } from "express";
import { addBusiness } from "../controllers/Auth/authController.ts";

import {
  login,
  signUp,
  forgotPassord,
  validatePasswordResetToken,
  updatePassword,
} from "../controllers/Auth/authController.js";

const authRouter = Router();


// Auth route
authRouter.route("/sign-up").post(signUp);
authRouter.route("/login").post(login);
authRouter.route("/forgot-password").post(forgotPassord);
authRouter
.route("/validate-reset-token:token")
.post(validatePasswordResetToken);
authRouter.route("/reset-password:token").post(updatePassword);


//Onboarding route
authRouter.route("/add-business").post(addBusiness);

export default authRouter;
