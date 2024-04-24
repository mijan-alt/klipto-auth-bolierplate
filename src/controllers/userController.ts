import User from "../Models/User.js";
import express from 'express'
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { isTokenValid } from "../utils/jwt.js";
export const getSingleUser = async (req: Request, res: Response) => {
  const id = req.params.id;

  try {
    //extract token from cookies

    const token = req.cookies.token;
    
    //verify the token

    const decodedToken = isTokenValid(token)
    
    console.log("my decoded token", decodedToken)

    // if (!user) {
    //   // Send 404 Not Found if user is not found
    //   return res
    //     .status(StatusCodes.NOT_FOUND)
    //     .json({ message: "User not found" });
    // }
    return

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