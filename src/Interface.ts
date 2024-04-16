import mongoose from "mongoose";
import { Document } from "mongoose";
import { Types } from "mongoose";

export interface UserInterface {
  username: string;
  email: string;
  password: string;
  passwordResetToken?: String;
  passwordResetTokenExpire?: Date;
  businesses?:[Types.ObjectId]
}


export interface BusinessInterface  {
  businessName: string;
  businessEmail: string;
  businessCategory: string;
  businessBio: string;
}
