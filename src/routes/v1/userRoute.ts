import { getActiveUser } from "../../controllers/User/userController";
import { Router } from "express";
import { newAuthChecker } from "../../middlewares/index";

const userRouter = Router();

userRouter.route("/active-user/:id").get(newAuthChecker, getActiveUser);

export default userRouter;
