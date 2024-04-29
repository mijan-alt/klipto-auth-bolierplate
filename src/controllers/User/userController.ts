import User from "../../Models/UserSchema.ts";
import express from "express";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { isTokenValid } from "../../utils/jwt.ts";
import { JwtPayload } from "jsonwebtoken";
import { UnAuthenticatedError } from "../../errors";

export const getActiveUser = async (req: Request, res: Response) => {
  // const id = req.params.id;

  try {

    if (!req.user) {
      throw new UnAuthenticatedError("User is not verified");
    }
    console.log(req.user, "request object")

    const userid = req.user;

    const user = await User.findById(userid).populate("business");

    if (!user) {
      // Send 404 Not Found if user is not found
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }

    
    // Send the populated user object
    res.status(StatusCodes.OK).json({
      user,
    });
  } catch (error) {
    console.error(error);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Oops there was an error" });
  }
};
