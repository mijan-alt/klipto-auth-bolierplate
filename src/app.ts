
import { Express } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/authRoute.js";
import { connectDb } from "./db/connectDb.js";
import bodyParser from "body-parser";
import express from 'express'
import userRouter from "./routes/userRoute.js";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from 'passport-google-oauth20'
import { config } from "dotenv";
import User from "./Models/User.js";
import { Request, Response } from "express";
import { UserInterface } from "./Interface.js";





const app:Express = express();

config()

// Define a custom interface extending express.User

app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);
passport.serializeUser((user:any, done) => {
  done(null, user.id)
})

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
     done(error, null)
  }
})

app.use(passport.initialize())
app.use(passport.session())


passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (
      accessToken: string,
      refreshToken: string,
      profile: any,
      done: any
    ) => {
      console.log("Profile:", profile); // Log the profile object
      try {
        // Check if user already exists in the db based on the
        let user = await User.findOne({
          email: profile.emails[0].value,
        });

        if (!user) {
          // If user does not exist
          user = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value, 
            image:profile.photos[0].value
          });
        }
        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

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

app.get('/auth/google', passport.authenticate("google", {
  scope: ["profile", "email"],
}))

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000", // Redirect to a success route
  }), (req: Request, res: Response) => {
    console.log(req)
    if (req.user) {
      const { user } = req
       res.redirect(`http://localhost:3000/addBusiness`);
      }
     
  }
    
  
);


app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
console.log("Thank you");
console.log("I am that I am");

connectDb(app);
