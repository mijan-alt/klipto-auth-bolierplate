"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const cors_1 = __importDefault(require("cors"));
const authRoute_js_1 = __importDefault(require("./routes/authRoute.js"));
const connectDb_js_1 = require("./db/connectDb.js");
const body_parser_1 = __importDefault(require("body-parser"));
const express_1 = __importDefault(require("express"));
const userRoute_js_1 = __importDefault(require("./routes/userRoute.js"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = __importDefault(require("passport-google-oauth20"));
const dotenv_1 = require("dotenv");
const User_js_1 = __importDefault(require("./Models/User.js"));
const app = (0, express_1.default)();
(0, dotenv_1.config)();
// Define a custom interface extending express.User
app.use((0, cors_1.default)({
    origin: [
        "http://localhost:5000",
        "http://localhost:3000",
        "http://localhost:3001",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"],
}));
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use((0, express_session_1.default)({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser((id, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield User_js_1.default.findById(id);
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
passport_1.default.use(new passport_google_oauth20_1.default({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    callbackURL: "/auth/google/callback",
    scope: ["profile", "email"],
}, (accessToken, refreshToken, profile, done) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Profile:", profile); // Log the profile object
    try {
        // Check if user already exists in the db based on the
        let user = yield User_js_1.default.findOne({
            email: profile.emails[0].value,
        });
        if (!user) {
            // If user does not exist
            user = yield User_js_1.default.create({
                googleId: profile.id,
                username: profile.displayName,
                email: profile.emails[0].value,
                image: profile.photos[0].value
            });
        }
        return done(null, user);
    }
    catch (error) {
        return done(error, null);
    }
})));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json());
app.get('/auth/google', passport_1.default.authenticate("google", {
    scope: ["profile", "email"],
}));
app.get("/auth/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: "http://localhost:3000", // Redirect to a success route
}), (req, res) => {
    console.log(req);
    if (req.user) {
        const { user } = req;
        res.redirect(`http://localhost:3000/addBusiness`);
    }
});
app.use("/api/v1/auth", authRoute_js_1.default);
app.use("/api/v1/user", userRoute_js_1.default);
console.log("Thank you");
console.log("I am that I am");
(0, connectDb_js_1.connectDb)(app);
