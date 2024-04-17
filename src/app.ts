
import { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authRoute.js";
import { connectDb } from "./db/connectDb.js";
import bodyParser from "body-parser";
import express from 'express'
import userRouter from "./routes/userRoute.js";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  cors({
    origin: ["http://localhost:5000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders:["Authorization", "Content-Type"]
  }) 
);
app.use(cookieParser());
app.use(express.json());


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
console.log("Thank you");
console.log("I am that I am");

connectDb(app);
