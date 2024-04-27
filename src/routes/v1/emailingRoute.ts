import { Router } from "express";
import { newAuthChecker } from "../../middlewares";
import {CreateEmailList, ReadAllEmailList, ReadSingleEmailList, UpdateEmailList, DeleteEmailList} from "../../controllers/Email/EmailList"

const emailingRouter = Router();


//Emaillist route for business email
emailingRouter.route("email-list").post(newAuthChecker, CreateEmailList);
emailingRouter.route("email-list-all").get(newAuthChecker, ReadAllEmailList);
emailingRouter
  .route("email-list-single")
  .get(newAuthChecker, ReadSingleEmailList);
emailingRouter.route("email-list").patch(newAuthChecker, UpdateEmailList);
emailingRouter.route("email-list").delete(newAuthChecker, DeleteEmailList);



export default emailingRouter;