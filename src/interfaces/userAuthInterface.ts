import mongoose from "mongoose";
import { Types } from "mongoose";
import { Document } from "mongodb";

interface UserInterface extends Document {
  username: string;
  email: string;
  password: string;
  passwordResetToken: String | undefined;
  passwordResetTokenExpire?: Date;
  googleId?: string;
  business: Types.ObjectId;
  userdp?: string;
  emailVerified: boolean;
}

interface BusinessInterface extends Document {
  businessName: string;
  businessEmail: string;
  businessCategory: string;
  businessBio: string;
  userId: Types.ObjectId;
  emailList: Types.ObjectId[];
}

export { UserInterface, BusinessInterface };
