import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnAuthenticatedError, ValidationError } from "../errors";
import { config } from "dotenv";
import { StatusCodes } from "http-status-codes";

const secreteKey: string | any = process.env.JWT_SECRET;

const newAuthCheker = (req: Request, res: Response, next: NextFunction)  => {

    const token = req.cookies["uToken"];

    if (!token) {
        throw new UnAuthenticatedError("Un authorized access")
    }

    try {
      const decodedToken = jwt.verify(token, secreteKey);

      if (!decodedToken) {
        throw new ValidationError("You are not logged in");
      }

      req.user = decodedToken;

      next();
    } catch (error) {
        res.status(StatusCodes.FORBIDDEN).json({ message: "Invalid token" });
    }

}

export default newAuthCheker;

