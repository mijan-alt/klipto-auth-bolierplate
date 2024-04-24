import { getSingleUser } from "../controllers/userController.js";
import { Router } from "express";
import { authenticateUser } from "../middlewares/authChecker.js";


const userRouter = Router()

userRouter.route("/single-user/:id").get(getSingleUser);

export default userRouter
