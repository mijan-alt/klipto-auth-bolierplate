import { NextFunction, Request, Response } from "express"
import EmailListSchema from "../../Models/EmailListSchema"
import User from "../../Models/UserSchema";

const CreateEmailList: Function = (req: Request, res: Response, next: NextFunction) => {
    
    const userid = req.user;

    const activeUser = User.findOne({ id: userid });
    
    if (!activeUser) {
        throw new UnAuthenticatedError();
    }

    


}