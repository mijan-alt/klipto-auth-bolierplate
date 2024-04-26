import { getSingleUser } from "../controllers/Auth/userController.ts";
import { Router } from "express";
import { newAuthChecker } from "../middlewares/";

const userRouter = Router();

userRouter.route("/single-user/:id").get(newAuthChecker, getSingleUser);

export default userRouter;
