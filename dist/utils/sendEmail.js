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
exports.sendMails = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = require("dotenv");
const googleapis_1 = require("googleapis");
(0, dotenv_1.config)();
const clientId = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;
const redirectUri = process.env.REDIRECT_URI;
const refreshToken = process.env.REFRESH_TOKEN;
const oAuth2Client = new googleapis_1.google.auth.OAuth2(clientId, clientSecret, redirectUri);
oAuth2Client.setCredentials({ refresh_token: refreshToken });
// export const sendMail = async (options: any) => {
//   const transporter: Transporter = nodemailer.createTransport({
//     host: process.env.SMTP_HOST,
//     port: Number(process.env.SMTP_PORT),
//     service: process.env.SMTP_SERVICE,
//     // secure: true, // true for 465, false for other ports
//     auth: {
//       user: process.env.SMTP_MAIL, // generated ethereal user
//       pass: process.env.SMTP_PASS, // generated ethereal password
//     },
//   });
//   const mailOptions = {
//     from: process.env.SMTP_MAIL,
//     to: options.email,
//     subject: options.subject,
//     html: options.html,
//   };
//   await transporter.sendMail(mailOptions);
// };
const sendMails = (_a) => __awaiter(void 0, [_a], void 0, function* ({ email, subject, html }) {
    try {
        const accessToken = yield oAuth2Client.getAccessToken();
        const transporter = nodemailer_1.default.createTransport({
            service: 'gmail',
            auth: {
                type: "OAuth2",
                user: "mijanigoni@gmail.com",
                clientId: clientId,
                clientSecret: clientSecret,
                refreshToken: refreshToken,
                accessToken: accessToken.token,
            },
        });
        const mailOptions = {
            from: 'mijanigoni@gmail.com',
            to: email,
            subject: subject,
            html: html
        };
        yield transporter.sendMail(mailOptions);
    }
    catch (error) {
        return error;
    }
});
exports.sendMails = sendMails;
