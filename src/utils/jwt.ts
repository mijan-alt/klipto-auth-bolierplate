import jwt, { JwtPayload } from "jsonwebtoken";
import { config } from "dotenv";
import { ObjectId } from "mongodb";

config();

type jwt = {
  id: string;
  maxAge: number;
}

export const createJWT = (id: string, maxAge: number) => {
  return jwt.sign({ id }, `${process.env.JWT_SECRET}`, {
    expiresIn: maxAge,
  });
};

export const isTokenValid = (token: string) => jwt.verify(token, `${process.env.JWT_SECRET}`);
