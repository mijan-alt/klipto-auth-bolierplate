import { getSingleUser } from "../controllers/userController.js";
import { Router } from "express";


const userRouter = Router()

userRouter.route('/single-user/:id').get(getSingleUser)

export default userRouter
