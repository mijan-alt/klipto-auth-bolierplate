import User from "../../Models/UserSchema.ts";
import { StatusCodes } from "http-status-codes";
import { Express, Request, Response } from "express";
import { UserInterface } from "../../interfaces/userAuthInterface.ts";
import jwt from "jsonwebtoken";
import { createJWT } from "../../utils/jwt.ts";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import fs from "fs";
import path from "path";
import ejs from "ejs";
import { sendMails } from "../../utils/sendEmail.ts";
import { isTokenValid } from "../../utils/jwt.js";
import crypto from "crypto";
import { Business } from "../../Models/BusinessSchema.ts";
import { BusinessInterface } from "../../interfaces/userAuthInterface.ts";
import {
  ValidationError,
  UnAuthenticatedError,
  NotfoundError,
  BadRequestError,
  UnAuthorizedError,
} from "../../errors/index.ts";

config();

const localUrl = process.env.BASE_SERVER_URL;
const clientUrl = process.env.CLIENT_URL;

export const signUp = async (req: Request, res: Response) => {
  const {
    email,
    password,
    username,
    imageurl,
  }: {
    email: string;
    password: string;
    username: string;
    imageurl: string;
  } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user) {
      // Email already exists
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ message: "Email Already Exists" });
    }

    const data = { email, password, username, imageurl };

    const userData = new User(data);

    // Save the user data to the database
    const newUser = await userData.save();

    if (!newUser) {
      throw new BadRequestError("Unable to create user");
    }

    const maxAge = 90 * 24 * 60 * 60 * 1000;
    const token = createJWT(newUser._id, maxAge);
    console.log("my token", token);
    res.cookie("uToken", token, { httpOnly: true }); // Store the token in a cookie but make it available only on the server

    // Send a JSON response indicating success
    res
      .status(StatusCodes.OK)
      .json({ message: "Account created successfully", userId: newUser._id });

    // Redirect the user after a short delay (e.g., 1 second)
    // res.redirect(
    //   `http://localhost:3000/auth/onboarding?userId=${newUser._id}`
    // );
    // setTimeout(() => {
    //     console.log("Redirecting...");
    // }, 1000);
  } catch (error) {
    console.log(error);
    // Handle any errors here
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }
};

export const addBusiness = async (req: Request, res: Response) => {
  const {
    businessName,
    businessEmail,
    businessCategory,
    businessBio,
  }: {
    businessName: string;
    businessEmail: string;
    businessCategory: string;
    businessBio: string;
  } = req.body;
  const userId: string = req.query.userId as string; //Get the userId from thre query parameters

  try {
    //find the user by Id
    const user = await User.findById(userId);

    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "User not found" });
    }
    const businessData = {
      businessName,
      businessEmail,
      businessCategory,
      businessBio,
      userId: userId,
    };
    //create a new business
    const newBusiness = new Business(businessData);

    await newBusiness.save();
    user.business = newBusiness._id;
    await user.save();
  

    res.status(StatusCodes.OK).json({
      message: "Account signed in succesffuly",
      user,
    });

    console.log("my createad business");
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Something went wrong" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password }: { email: string; password: string } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
      return;
      return;
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      throw new BadRequestError("Invalid Credentails");
    }

    const maxAge = 90 * 24 * 60 * 60 * 1000;
    const token = createJWT(user._id, maxAge);
    res.cookie("uToken", token, { httpOnly: true });
    res.status(StatusCodes.OK).json({
      message: "Account signed in succesffuly",
      user,
    });
  } catch (error) {
    res.status(401).json({ error: "Could not sign in" });
  }
};

export const forgotPassord = async (req: Request, res: Response) => {
  const { email }: { email: string } = req.body;
  console.log("email", email);

  const user = await User.findOne({ email });

  console.log("user", user);

  if (!user) {
    console.log("User does not exit");
    res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    return;
    return;
  }

  const resetToken = user.createResetPasswordToken();
  console.log("my reset token", resetToken);

  // save the encrypted token in the data base
  await user.save();

  console.log(resetToken);
  const resetUrl = `${localUrl}/api/v1/auth/verify/${resetToken}`;

  const templatePath = path.join(
    process.cwd(),
    "/src/views/forgotpassword.ejs"
  );

  const renderHtml = await ejs.renderFile(
    templatePath,
    {
      userFullname: user.username,
      userEmail: user.email,
      userRecoveryUrl: resetUrl,
    },
    { async: true }
  );

  try {
    await sendMails({
      email: user.email,
      subject: "Password Recovery",
      html: renderHtml,
    });

    res
      .status(StatusCodes.OK)
      .json({ message: "Password reset link has been sent to your email" });
  } catch (error) {
    //  in the event of an unfuufllied promise , we want to set the reset tokens to undefined
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    //then we save these new values to the database
    console.log(error, "error");
    user.save();
    res.status(StatusCodes.REQUEST_TIMEOUT).json({
      message: "There was an error sending password reset email. Try again ",
    });
  }
};

export const verifyToken = async (req: Request, res: Response) => {
  const { token } = req.params;
  const clientURL = process.env.CLIENT_URL;

  try {
    // Encrypt the incoming token
    const encryptedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find the user whose passwordResetToken matches the encrypted token
    const user = await User.findOne({
      passwordResetToken: encryptedToken,
      passwordResetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.redirect(`${clientURL}/auth/recover`);
      return res.redirect(`${clientURL}/auth/recover`);
    }

    // If token is valid, redirect to client-side password reset form

    return res.redirect(`${clientURL}/reset-password/${token}`);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Error verifying password reset token" });
  }
};

export const updatePassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword }: { newPassword: string } = req.body;

  try {
    if (!newPassword) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ error: "New password is required" });
    }

    // Encrypt the incoming token
    const encryptedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find the user whose passwordResetToken matches the encrypted token
    const user = await User.findOne({
      passwordResetToken: encryptedToken,
      passwordResetTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(StatusCodes.NON_AUTHORITATIVE_INFORMATION)
        .json({ message: "Token is invalid or expired" });
    }

    // Update user's password
    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;

    // save the updated information to db
    await user.save();

    return res
      .status(StatusCodes.OK)
      .json({ message: "Password reset successful" });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Error resetting password" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("uToken");
    res.status(StatusCodes.OK).json({ message: "User signed out succesffuy" });
  } catch (error) {
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ mesage: "Oops, there was an error signing out" });
  }
};
