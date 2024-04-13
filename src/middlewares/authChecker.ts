import { isTokenValid } from "../utils/jwt.js";
import { Express, Request, Response, NextFunction } from "express";
import UnAuthorizedError from "../errors/UnauthorizedError.js";
import User from "../Models/User.js";

export const authenticateUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let token;

  // check header

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer")) {
    token = authHeader.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new UnAuthorizedError("Authentication is invalid");
  }

  try {
    const payload = isTokenValid(token) as { _id: string }; //get the decoded token

    const user = await User.findById(payload._id);

    if (!user) {
      throw new UnAuthorizedError("User not found");
    }

    next();
  } catch (error) {
    throw new UnAuthorizedError("Authentication is invalid");
  }
};
