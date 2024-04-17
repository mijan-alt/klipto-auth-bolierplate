import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { ObjectId } from "mongodb";

config();

export const createJWT = (id: ObjectId, maxAge: number) => {
  return jwt.sign({ id }, `${process.env.JWT_SECRET}`, {
    expiresIn: maxAge,
  });
};

export const isTokenValid = (token: string) =>
  jwt.verify(token, `${process.env.JWT_SECRET}`);
