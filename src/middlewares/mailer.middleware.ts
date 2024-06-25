import { log } from "console"
import { NextFunction } from "express";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import { ErrorHandler } from "../utils/utilities";
import User from "../models/userModel";
import { VERIFY } from "../constants/constants";
import mongoose from "mongoose";


const sendMail = async(email:string, emailType:string, userID:mongoose.Schema.Types.ObjectId, next:NextFunction) => {
    try {
        let user;
        const hashedToken = await bcryptjs.hash(userID.toString(), 6);


        if (emailType === VERIFY) {
            user = await User.findByIdAndUpdate(userID, {
                verificationToken:hashedToken,
                verificationTokenExpires:Date.now() + 90000
            });
            if (!user) return next(new ErrorHandler("Internal Server Error", 500))
        }

        const transporter = nodemailer.createTransport({
            host:process.env.TRANSPORTER_HOST,
            port:Number(process.env.TRANSPORTER_PORT),
            secure:false,
            auth:{
                user:process.env.TRANSPORTER_ID,
                pass:process.env.TRANSPORTER_PASSWORD
            }
        });

        const mailOptions = {
            from:process.env.TRANSPORTER_ID,
            to:email,
            subject:"Verify your email",
            html:`
            <html>
                <head>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            background-color: #f4f4f4;
                            margin: 0;
                            padding: 0;
                        }
                        .mail_cont{
                            border:2px solid red;
                            width:530px;
                            margin:20px auto;
                            padding:20px;
                            border-radius:8px;
                        }
                            .subject{
                        
                            }
                            .receiver{
                        
                            }
                            .mail_para{
                                text-align:justify;
                            }
                            .verify_link_cont{
                                margin:30px auto;
                                font-size:18px;
                                display:block;
                                text-align:center;
                            }
                                .verify_link_cont .verify_btn{
                                    color:white;
                                    border-radius:8px;
                                    text-decoration:none;
                                    padding:10px 30px;
                                    background:linear-gradient(to bottom right, #ffb1be, #ff3153);
                                }
                                .verify_link_cont .verify_btn:hover{
                                    background: #ffbcca;
                                }
                            .verify_uri{
                                margin:10px auto;
                                width:max-content;
                            }
                        
                    </style>
                </head>
                <body>
                    <div class="mail_cont>
                        <h3 class="subject">Subject: ${emailType === "VERIFY" ? "Please Verify Your Email Address" : "Please Verify Your Email To Change Password"}</h3>
                        <div class="receiver">Dear ${user?.name},</div>
                        <div class="mail_para">
                            ${emailType === "VERIFY"||emailType === "REGISTER" ? "Thank you for registering with Amazaun! To ensure the security of your account and access all features, please verify your email address by clicking the link below:" : "To change your password first We need to verify it's you"}
                        </div>
                        <div class="verify_link_cont">
                            <a class="verify_btn" href="${process.env.SERVER_URI}/verifyemail?token=${hashedToken}&?emailtype=${emailType}">Verify</a>
                        </div>
                        <div class="verify_uri">URL :- ${process.env.SERVER_URI}/verifyemail?token=${hashedToken}&?emailtype=${emailType}</div>
                        <div class="mail_para">If you are unable to click the link above, please copy and paste it into your browser's address bar.</div>
                        <div class="mail_para">Once your email address is verified, you'll be able to [describe any benefits or features unlocked after verification].</div>
                        <div class="mail_para">If you did not create an account with Amazaun, please ignore this email.</div>
                        <div class="mail_para">Thank you,</div>
                        <div class="mail_para">The Amazaun Team</div>
                    </div>
                </body>
            </html>
            `
        };

        const resMail = transporter.sendMail(mailOptions);
        return resMail;
    } catch (error) {
        console.log(error);
        throw new ErrorHandler("This error is from mailer.middleware.ts", 500);
    }
};

export default sendMail;