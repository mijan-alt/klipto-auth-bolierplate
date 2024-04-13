
import { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authRoute.js";
import { connectDb } from "./db/connectDb.js";
import bodyParser from "body-parser";
import express from 'express'

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  cors({
    origin: ["http://localhost:5000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }) 
);
app.use(cookieParser());
app.use(express.json());
app.use("/api/v1/auth", authRouter);
console.log("Thank you");
console.log("I am that I am");

connectDb(app);
