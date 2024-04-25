import User from "../Models/User.js";
import { StatusCodes } from "http-status-codes";
import { Express, Request, Response } from "express";
import { UserInterface } from "../Interface.js";
import jwt from "jsonwebtoken";
import { createJWT } from "../utils/jwt.js";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import UnAuthenticatedError from "../errors/UnAuthenticated.js";
import fs from "fs";
import path from "path";
import ejs from "ejs";
import { sendMails } from "../utils/sendEmail.js";
import { isTokenValid } from "../utils/jwt.js";
import crypto from "crypto";
import { Business } from "../Models/Business.js";
import { BusinessInterface } from "../Interface.js";
import BadRequestError from "../errors/BadRequest.js";
import passport from 'passport'
import GoogleStrategy from 'passport-google-oidc'




config();
const localUrl = process.env.BASE_SERVER_URL;
const clientUrl = process.env.CLIENT_URL;



export const signUp = async (req: Request, res: Response) => {
  const { email, password, username } = req.body;

  try {
    console.log("hitting the sign up")
    const user: UserInterface | null = await User.findOne({ email });
    if (user) {
      throw new Error("Email Already Exist");
    }

    const userData: UserInterface = new User({
      email,
      password,
      username,
    });

    // Save the user data to the database
    const newUser = await userData.save();
    const maxAge = 90 * 24 * 60 * 60 * 1000;
    const token = createJWT(newUser._id, maxAge);
    console.log("my token", token)
    res.cookie("jwt", token, { httpOnly: true }); //store the token in a cookie but make it available only on the server
   

    setTimeout(() => {
       res.redirect(`http://localhost:3000/onboarding?userId=${newUser._id}`);
    }, 5000)
        return res
          .status(StatusCodes.OK)
          .json({ message: "Sign up successful" });
  } catch (error) {
     res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({message:"Oops!, something went wrong"})
  }
};

export const addBusiness = async (req: Request, res: Response) => {
  const { businessName, businessEmail, businessCategory, businessBio } =
    req.body;
  const userId = req.query.userId; //Get the userId from thre query parameters

  try {
    //find the user by Id
    const user: UserInterface | null = await User.findById(userId);

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
    const newBusiness: BusinessInterface = new Business(businessData);

    await newBusiness.save();

    if (user.businesses.length >= 3) {
      return res.status(400).json({
        message: "User already has the maximum number of businesses (3).",
      });
    }
    user.businesses.push(newBusiness._id);

    await user.save();

   
    console.log("my createad business");
   return res.status(StatusCodes.OK).json({
      message: "Account signed in succesffuly",
      user,
    });

  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Something went wrong" });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user: any = await User.findOne({ email });

    if (!user) {
      res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      throw new BadRequestError("Invalid Credentails");
    }

    const maxAge = 90 * 24 * 60 * 60 * 1000;
    const token = createJWT(user._id, maxAge);
     res.cookie('jwt', token, {httpOnly:true})
  return  res.status(StatusCodes.OK).json({
      message: "Account signed in succesffuly",
      user,
    });
  } catch (error) {
    res.status(401).json({ error: "Could not sign in" });
  }
};

export const forgotPassord = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user: any = await User.findOne({ email });

  if (!user) {
    console.log("User does not exit");
    res.status(StatusCodes.NOT_FOUND).json({ message: "User not found" });
  }

  const resetToken = user.createResetPasswordToken();
  console.log("my reset token", resetToken);

  // save the encrypted token in the data base
  await user.save();

  console.log(resetToken);
  const resetUrl = `${localUrl}/api/v1/users/resetPassword/${resetToken}`;
  const templatePath = path.join(__dirname, "../views/forgotpassword.ejs");
  const renderHtml = await ejs.renderFile(
    templatePath,
    {
      userFullname: user.fullname,
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

    user.save();
    res.status(StatusCodes.REQUEST_TIMEOUT).json({
      message: "There was an error sending password reset email. Try again",
    });
  }
};

export const validatePasswordResetToken = async (
  req: Request,
  res: Response
) => {
  const { token } = req.params;

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
      return res
        .status(StatusCodes.NON_AUTHORITATIVE_INFORMATION)
        .json({ message: "Token is invalid or expired" });
    }

    // If token is valid, redirect to client-side password reset form
    const clientURL = process.env.CLIENT_URL;
    return res.redirect(`${clientURL}/reset-password/${token}`);
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ error: "Error verifying password reset token" });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
  const { newPassword } = req.body;

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
  res.clearCookie('jwt')
  res.status(StatusCodes.OK).json({message:'User signed out succesffuy'})
} catch (error) {
  return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({mesage:"Oops, there was an error signing out"})
}

}