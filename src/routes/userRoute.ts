import { getSingleUser } from "../controllers/Auth/userController.ts";
import { Router } from "express";
import { authenticateUser } from "../middlewares/authChecker.ts";

const userRouter = Router();

userRouter.route("/single-user/:id").get(getSingleUser);

export default userRouter;
