import { NextFunction } from "express";
import { Model } from "mongoose";



export class ErrorHandler extends Error {
    constructor(public message:string, public statusCode:number){
        super(message);
        this.statusCode = statusCode;
        // this.message = message;
        // Error.captureStackTrace(this, this.constructor);
    }
};

export const throwError = (user:any, errorMessage:string, errorCode:number, next:NextFunction) => {
    console.log("))))))))))))))))))))))");
    console.log(user);
    console.log("))))))))))))))))))))))");
    
    
    if (user) return next(new ErrorHandler(errorMessage, errorCode));
};  // kahi use nahi ho raha