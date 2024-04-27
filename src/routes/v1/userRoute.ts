import { getActiveUser } from "../../controllers/User/userController.ts";
import { Router } from "express";
import { newAuthChecker } from "../../middlewares/index.ts";

const userRouter = Router();

userRouter.route("/single-user/:id").get(newAuthChecker, getActiveUser);

export default userRouter;
