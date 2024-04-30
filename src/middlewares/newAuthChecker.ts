import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { UnAuthenticatedError, ValidationError } from "../errors";
import { config } from "dotenv";

const secretKey: string | any = process.env.JWT_SECRET;

const newAuthChecker = (req: Request, res: Response, next: NextFunction) => {

  const token = req.cookies.uToken



  if (!token) {
    throw new UnAuthenticatedError("Un authorized access");
  }

  try {
    const decodedToken = jwt.verify(token, secretKey) as JwtPayload;
    console.log("decodedToken", decodedToken)

    if (!decodedToken) {
      throw new ValidationError("You are not logged in");
    }

    req.user = decodedToken.id 
    console.log(req.user)

     next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export { newAuthChecker };
