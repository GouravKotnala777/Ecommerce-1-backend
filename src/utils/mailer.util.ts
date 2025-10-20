import { log } from "console"
import { NextFunction } from "express";
import bcryptjs from "bcryptjs";
import nodemailer from "nodemailer";
import { ErrorHandler } from "./utilities";
import User from "../models/userModel";
import { RESET_PASSWORD, VERIFY } from "../constants/constants";
import mongoose from "mongoose";


const sendMail = async(email:string, emailType:string, userID:mongoose.Schema.Types.ObjectId, next:NextFunction, referrerUserID?:string) => {
    try {

        let user;
        const hashedToken = await bcryptjs.hash(userID.toString(), 6);

        if (!process.env.BREVO_KEY) throw new ErrorHandler("BREVO_KEY not found", 404);
        if (!process.env.BREVO_URL) throw new ErrorHandler("BREVO_URL not found", 404);
        if (!process.env.BREVO_USER_NAME) throw new ErrorHandler("BREVO_USER_NAME not found", 404);
        if (!process.env.BREVO_EMAIL_ID) throw new ErrorHandler("BREVO_EMAIL_ID not found", 404);



        if (emailType === VERIFY) {
            user = await User.findByIdAndUpdate(userID, {
                verificationToken:hashedToken,
                verificationTokenExpires:Date.now() + 90000
            });
            if (!user) return next(new ErrorHandler("Internal Server Error", 500));
        }
        else if(emailType === RESET_PASSWORD) {
            user = await User.findByIdAndUpdate(userID, {
                resetPasswordToken:hashedToken,
                resetPasswordExpires:Date.now() + 90000
            });
            if (!user) return next(new ErrorHandler("Internal Server Error", 500));
        }

        const mailOptions = {
            from:process.env.BREVO_EMAIL_ID,
            to:email,
            subject:emailType === VERIFY ?
                        "Verify your email"
                        :
                        "Update Your Password",
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
                        <h3 class="subject">Subject: ${emailType === "VERIFY" ? "Please Verify Your Email Address" : "Please Verify Your Email To Update Password"}</h3>
                        <div class="receiver">Dear ${user?.name},</div>
                        <div class="mail_para">
                            ${emailType === "VERIFY"||emailType === "REGISTER" ? "Thank you for registering with Ecommerce! To ensure the security of your account and access all features, please verify your email address by clicking the link below:" : "To change your password first We need to verify it's you"}
                        </div>
                        <div class="verify_link_cont">
                            <a class="verify_btn" href="${process.env.CLIENT_URL}/user/verifyemail?token=${hashedToken}&emailtype=${emailType}&referrerUserID=${referrerUserID}">Verify</a>
                        </div>
                        <div class="verify_uri">URL :- ${process.env.CLIENT_URL}/user/verifyemail?token=${hashedToken}&emailtype=${emailType}&referrerUserID=${referrerUserID}</div>
                        <div class="mail_para">If you are unable to click the link above, please copy and paste it into your browser's address bar.</div>
                        <div class="mail_para">Once your email address is verified, you'll be able to [describe any benefits or features unlocked after verification].</div>
                        <div class="mail_para">If you did not create an account with Ecommerce, please ignore this email.</div>
                        <div class="mail_para">Thank you,</div>
                        <div class="mail_para">The Ecommerce Team</div>
                    </div>
                </body>
            </html>
            `
        };

        const res = await fetch(process.env.BREVO_URL, {
            method:"POST",
            headers:{
                "Content-Type":"application/json",
                "api-key":process.env.BREVO_KEY
            },
            body:JSON.stringify({
                sender:{
                    "name":process.env.BREVO_USER_NAME,
                    "email":process.env.BREVO_EMAIL_ID
                },
                to:[{
                    "email":email
                }],
                subject:mailOptions.subject,
                textContent:"",
                htmlContent:mailOptions.html
            })
        });
        const data = await res.json();
        console.log({data});

        if (res.ok && data.messageId) {
            console.log("Email sent successfully:", data.messageId);
        }
        else{
            console.error("Failed to send email:", data);
        }

        return data.messageId?true:false;
    } catch (error) {
        console.log(error);
        throw new ErrorHandler("This error is from mailer.middleware.ts", 500);
    }
};
export default sendMail;
