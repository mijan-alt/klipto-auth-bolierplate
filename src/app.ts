import { Express, Request, Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/v1/authRoute.ts";
import { connectDb } from "./db/connectDb.ts";
import bodyParser from "body-parser";
import express from "express";
import userRouter from "./routes/v1/userRoute.ts";
import session from "express-session";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "dotenv";
import User from "./Models/UserSchema.ts";

config(); // Load environment variables from .env file

const app: Express = express();

app.use(
  cors({
    origin: [
      "http://localhost:5000",
      "http://localhost:3000",
      "http://localhost:3001",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
  })
);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
  })
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

app.use(passport.initialize());
app.use(passport.session());

const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

if (!clientID || !clientSecret) {
  throw new Error(
    "Google OAuth client ID and secret are not defined in environment variables."
  );
}

passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
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
        // Check if user already exists in the db based on the email
        let user = await User.findOne({ email: profile.emails[0].value });

        if (!user) {
          // If user does not exist, create a new user
          user = await User.create({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            image: profile.photos[0].value,
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

app.use(cookieParser());
app.use(express.json());

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    failureRedirect: "http://localhost:3000", // Redirect to a failure route
  }),
  (req: Request, res: Response) => {
    if (req.user) {
      res.redirect(`http://localhost:3000/addBusiness`);
    } else {
      res.redirect(`http://localhost:3000`);
    }
  }
);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

connectDb(app);
