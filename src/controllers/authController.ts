import User from "../Models/User.js";
import { StatusCodes } from "http-status-codes";
import { Express, Request, Response } from "express";
import { UserInterface } from "../Interface.js";
import jwt from "jsonwebtoken";
import { createJWT } from "../utils/jwt.js";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import UnAuthorizedError from "../errors/UnauthorizedError.js";
import fs from 'fs'
import path from 'path'
import ejs from 'ejs'
import { sendMails } from "../utils/sendEmail.js";
import { isTokenValid } from "../utils/jwt.js";
import crypto from 'crypto'


config();
const localUrl = process.env.BASE_SERVER_URL;
const clientUrl = process.env.CLIENT_URL;
export const signUp = async (req: Request, res: Response) => {
  const { fullname, email, password } = req.body;

  try {
    const emailAlreadyExist = await User.findOne({ email });
    if (emailAlreadyExist) {
      throw new Error("Email Already Exist");
    }

    let userData: UserInterface = {
      fullname,
      email,
      password,
    };
    const newUser = await User.create(userData);

    res
      .status(StatusCodes.CREATED)
      .json({ message: "User created successfuly", data: newUser });
  } catch (error) {
    console.log(error);
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
      throw new UnAuthorizedError("Invalid Credentails");
    }

    const maxAge = 90 * 24 * 60 * 60 * 1000;
    const token = createJWT(user._id, maxAge);
    res.setHeader("Authorization", "Bearer" + token);

    res.status(StatusCodes.OK).json({
      message: "Account signed in succesffuly",
      authToken: token,
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
          res.status(StatusCodes.NOT_FOUND).json({message:"User not found"})
        }

      const resetToken = user.createResetPasswordToken()

    // save the encrypted token in the data base
      await user.save()

      console.log(resetToken)
      const resetUrl = `${localUrl}/api/v1/users/resetPassword/${resetToken}`;
       const templatePath = path.join(
         __dirname,
         "../views/forgotpassword.ejs"
       );
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
            subject:"Password Recovery",
            html: renderHtml
        });
       
       res.status(StatusCodes.OK).json({message:'Password reset link has been sent to your email'})
     } catch (error) {
      //  in the event of an unfuufllied promise , we want to set the reset tokens to undefined
       user.passwordResetToken = undefined;
       user.passwordResetTokenExpire = undefined
       //then we save these new values to the database

       user.save()
       res.status(StatusCodes.REQUEST_TIMEOUT).json({message:"There was an error sending password reset email. Try again"})
     }
  };

export const resetPassword = async (req: Request, res: Response) => {
  const { token } = req.params;
    try {
    //encrypt the incoming token
    const encryptedToken = crypto.createHash('sha256').update(token).digest('hex')

    // find the user whose passwordResetToken matches req.params.token
    const user = User.findOne({passwordResetToken:encryptedToken, passwordResetTokenExpire:{$gt:Date.now()}})
    
    if (!user) {
       res.status(StatusCodes.NON_AUTHORITATIVE_INFORMATION).json({message:'Token is invalid or expired'})
      }
      
      

  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ error:"Error verifyng passoword"});
  }
};