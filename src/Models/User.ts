import mongoose from "mongoose";
import { UserInterface } from "../Interface.js";
import bcrypt from "bcrypt";
import crypto from 'crypto'

// declare the interface here
interface User {
  fullname: string;
  email: string;
  password: string;
  passwordResetToken?: string | null;
  passwordResetTokenExpire?: Date | null;
}

const UserSchema = new mongoose.Schema<User>({
  fullname: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },

  passwordResetToken: String,
  passwordResetTokenExpire:Date
});

UserSchema.pre("save", async function () {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.comparePassword = async function (userPassword: string) {
  const isMatch = await bcrypt.compare(userPassword, this.password);
  return isMatch;
};


UserSchema.methods.createResetPasswordToken = function() {
  const resetToken = crypto.randomBytes(32).toString("hex");
  
  //encrypt the reset token with createHeash and convert the result into hexadecimal format
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
   console.log(resetToken, this.passwordResetToken)
  // We want this token to expire in 10 minutes
  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000

  return resetToken
}

const User = mongoose.model<User>("User", UserSchema);

export default User;
