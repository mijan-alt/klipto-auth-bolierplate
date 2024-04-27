import { NextFunction, Request, Response } from "express";
// import EmailListSchema from "../../Models/EmailListSchema";

const CreateEmailList: Function = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const usertoken = req.cookies["uToken"];
};
