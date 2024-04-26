import mongoose from "mongoose";
import { Document } from "mongoose";
import { Types } from "mongoose";

export interface UserInterface extends Document {
  username: string;
  email: string;
  password: string;
  passwordResetToken?: String;
  passwordResetTokenExpire?: Date;
  googleId: string;
  businesses: Types.ObjectId[];
  image?: string;
}


export interface BusinessInterface extends Document {
  businessName: string;
  businessEmail: string;
  businessCategory: string;
  businessBio: string;
  userId: Types.ObjectId;
}

// Assuming 'e' is your namespace
namespace e {
  // Define the User type within the namespace
  export interface User {
    _id: string;
    // Other properties of the user object if any
  }
}
