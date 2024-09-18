import { CookieOptions, NextFunction, Response } from "express";
import mongoose, { Model } from "mongoose";
import { UserTypes } from "../models/userModel";

export const cookieOptions:CookieOptions = {
    httpOnly:true, secure:true, sameSite:"none", expires: new Date(Date.now() + 604800000)
};

export class ErrorHandler extends Error {
    constructor(public message:string, public statusCode:number){
        super(message);
        this.statusCode = statusCode;
        // this.message = message;
        // Error.captureStackTrace(this, this.constructor);
    }
};
//export class NextResponseHandler extends Error {
//    constructor(public message:string, public statusCode:number){
//        super(message);
//        this.statusCode = statusCode;
//        // this.message = message;
//        // Error.captureStackTrace(this, this.constructor);
//    }
//};
export const sendToken = async(
    model:(mongoose.Document<unknown, {}, UserTypes> & UserTypes & Required<{_id: mongoose.Schema.Types.ObjectId;}>) | null,
    res:Response,
    next:NextFunction) => {
    try {
        console.log("------------- (11.1)");
        const token = await model?.generateToken(model?._id);

        console.log({token});
        
        console.log("------------- (11.2)");
        
        res.cookie("userToken", token, cookieOptions);
        console.log("------------- (11.3)");
        return token;
    } catch (error) {
        console.log("------------- (11.4)");
        console.log(error);
        next(error);
    }
}
export const generateCoupon = () => {
    try {
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
        let code = "";

        for (let item = 0; item < 20; item++) {
            const randomIndex = Math.floor(Math.random()*characters.length)
            const element = characters[randomIndex];
            code = code+element;
        }
        
        return code;
    } catch (error) {
        console.log(error);
        return "";        
    }
}

export const throwError = (user:any, errorMessage:string, errorCode:number, next:NextFunction) => {
    console.log("))))))))))))))))))))))");
    console.log(user);
    console.log("))))))))))))))))))))))");
    
    
    if (user) return next(new ErrorHandler(errorMessage, errorCode));
};  // kahi use nahi ho raha