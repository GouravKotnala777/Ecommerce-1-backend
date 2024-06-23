import { NextFunction, Response } from "express";
import mongoose, { Model } from "mongoose";
import { UserTypes } from "../models/userModel";



export class ErrorHandler extends Error {
    constructor(public message:string, public statusCode:number){
        super(message);
        this.statusCode = statusCode;
        // this.message = message;
        // Error.captureStackTrace(this, this.constructor);
    }
};
export const sendToken = async(model:(mongoose.Document<unknown, {}, UserTypes> & UserTypes & Required<{
    _id: mongoose.Schema.Types.ObjectId;
}>) | null, res:Response, next:NextFunction) => {
    try {
        const token = await model?.generateToken(model?._id);

        res.cookie("userToken", token, {expires: new Date(Date.now() + 604800000)});
    } catch (error) {
        console.log(error);
        next(error);
    }
}

export const throwError = (user:any, errorMessage:string, errorCode:number, next:NextFunction) => {
    console.log("))))))))))))))))))))))");
    console.log(user);
    console.log("))))))))))))))))))))))");
    
    
    if (user) return next(new ErrorHandler(errorMessage, errorCode));
};  // kahi use nahi ho raha