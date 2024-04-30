import { Router } from "express";
import { addBusiness } from "../../controllers/Auth/authController";

import {
  login,
  signUp,
  forgotPassord,
  verifyToken,
  updatePassword,
} from "../../controllers/Auth/authController";

const authRouter = Router();

// Auth route
authRouter.route("/sign-up").post(signUp);
authRouter.route("/login").post(login);
authRouter.route("/forgot-password").post(forgotPassord);
authRouter
  .route("/verify/:token")
  .get(verifyToken);
authRouter.route("/reset-password/:token").post(updatePassword);

//Onboarding route
authRouter.route("/add-business").post(addBusiness);

export default authRouter;
