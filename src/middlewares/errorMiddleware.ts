import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utilities";



export const errorMiddleware = (err:ErrorHandler, req:Request, res:Response, next:NextFunction) => {
    const statusCode = err.statusCode || 500;
    let message:string;

    if (err.name === "CastError") {
        message = "Wrong ObjectId formate";
    }
    else{
        message = err.message || "Internal Server Error";
    }
    console.log("))))))))))))))))))))))))))");
    // console.log(err);
    console.log(message);
    console.log("((((((((((((((((((((((((((");
    

    res.status(statusCode).json({success:false, message});
};