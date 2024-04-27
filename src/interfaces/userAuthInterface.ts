import mongoose from "mongoose";
import { Document } from "mongoose";
import { Types } from "mongoose";

interface UserInterface extends Document {
  username: string;
  email: string;
  password: string;
  passwordResetToken?: String;
  passwordResetTokenExpire?: Date;
  googleId: string;
  business: Types.ObjectId;
  image?: string;
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
