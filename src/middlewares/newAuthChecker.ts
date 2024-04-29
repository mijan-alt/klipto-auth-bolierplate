import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { UnAuthenticatedError, ValidationError } from "../errors";
import { config } from "dotenv";

const secretKey: string | any = process.env.JWT_SECRET;

const newAuthChecker = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies["uToken"];

  if (!token) {
    throw new UnAuthenticatedError("Un authorized access");
  }

  try {
    const decodedToken = jwt.verify(token, secretKey);

    if (!decodedToken) {
      throw new ValidationError("You are not logged in");
    }

    if (typeof decodedToken === "string") {
      throw new ValidationError("Unexpected token format");
    }

    if (!("id" in decodedToken)) {
      throw new ValidationError("Token does not contain user ID");
    }

    req.user = decodedToken.id;

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
};

export { newAuthChecker };
