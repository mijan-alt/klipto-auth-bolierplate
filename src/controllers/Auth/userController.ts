import User from "../../Models/UserSchema.ts";
import express from "express";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { isTokenValid } from "../../utils/jwt.ts";
import { JwtPayload } from "jsonwebtoken";

export const getSingleUser = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    //extract token from cookies

    const token = req.cookies.jwt;

    //verify the token

    const decodedToken: any = isTokenValid(token);

    console.log("my decoded token", decodedToken);

    if (decodedToken.id !== id) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Unauthorized access" });
    }

    const user = await User.findById(id);

    if (!user) {
      // Send 404 Not Found if user is not found
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }

    // Populate the 'businesses' field
    const populatedUser = await User.findById(id).populate("businesses");

    // Send the populated user object
    res.status(StatusCodes.OK).json({
      user: populatedUser,
    });
  } catch (error) {
    console.error(error);

    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Oops there was an error" });
  }
};
