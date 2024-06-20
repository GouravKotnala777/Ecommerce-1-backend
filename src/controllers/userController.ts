import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import {ErrorHandler} from "../utils/utilities";

export const register = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name, email, password, avatar, phone}:{name:string; email:string; password:string; avatar:string; phone:string;} = req.body;
        const user = await User.findOne({email});

        if (!req.cookies?.aaToken) return next(new ErrorHandler("User already exists", 401));

        const newUser = await User.create({
            name, email, password, avatar, phone
        });

        if (!req.cookies?.aaToken) return next(new ErrorHandler("Internal Server Error", 500));
        
        res.status(200).json({success:true, message:"Registration successfull"});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const aaGET = async(req:Request, res:Response, next:NextFunction) => {
    try {
        console.log("aaGET has ran");
        if (!req.cookies?.aaToken) return next(new ErrorHandler("Token not found", 401));
        console.log({cookies:req.cookies?.aaToken});
        res.status(200).json({success:true, message:"aaGET has ran"});        
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const aaPOST = async(req:Request, res:Response, next:NextFunction) => {
    try {
        console.log("aaPOST has ran");
        res.cookie("aaToken", "123456", {httpOnly:true, secure:true, sameSite:"none", expires: new Date(Date.now() + 604800000)});
        // console.log({cookies:req.cookies?.aaToken});
        res.status(200).json({success:true, message:"aaPOST has ran"});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};





// const aaaa = async(req:Request, res:Response, next:NextFunction) => {
//     try {
        
//     } catch (error) {
//         console.log(error);
//         next(error);        
//     }
// };
// const aaaa = async(req:Request, res:Response, next:NextFunction) => {
//     try {
        
//     } catch (error) {
//         console.log(error);
//         next(error);        
//     }
// };