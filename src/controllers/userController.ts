import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import {ErrorHandler} from "../utils/utilities";
import { AuthenticatedUserRequest } from "../middlewares/auth";

export const register = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name, email, password, avatar, mobile}:{name:string; email:string; password:string; avatar:string; mobile:string;} = req.body;

        console.log({name, email, password, avatar, mobile});

        const user = await User.findOne({email});
        
        console.log({user});

        if (user) return next(new ErrorHandler("User already exists", 401));

        const newUser = await User.create({
            name, email, password, avatar, mobile
        });

        if (!newUser) return next(new ErrorHandler("Internal Server Error", 500));
        
        res.status(200).json({success:true, message:"Registration successfull"});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const login  = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {email, password} = req.body;
        const isUserExist = await User.findOne({email});

        if (!isUserExist) return (next(new ErrorHandler("Wrong email or password 1", 404)));

        const isPasswordMatched = await isUserExist.comparePassword(password);


        console.log({isPasswordMatched});
        

        if (!isPasswordMatched) return (next(new ErrorHandler("Wrong email or password 2", 404)));

        const token = await isUserExist.generateToken(isUserExist._id);

        console.log({token});
        

        res.cookie("userToken", token, {expires: new Date(Date.now() + 604800000)})

        res.status(200).json({success:true, message:"Login successfull"});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const me  = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const user = (req as AuthenticatedUserRequest).user;

        if (!user) return next(new ErrorHandler("Login first", 401));

        res.status(200).json({success:true, message:user});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const updateMe  = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name, email, password, mobile} = req.body;
        const user = (req as AuthenticatedUserRequest).user;

        if (!user) return next(new ErrorHandler("user not found", 404));

        const updateMe = await User.findByIdAndUpdate(user._id, {
            ...(name&&{name}),
            ...(email&&{email}),
            ...(password&&{password}),
            ...(mobile&&{mobile})
        });

        if (!updateMe) return next(new ErrorHandler("Internal Server Error", 500));

        res.status(200).json({success:true, message:updateMe});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const logout  = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const user = (req as AuthenticatedUserRequest).user;

        if (!user) return next(new ErrorHandler("user not found", 404));

        res.cookie("userToken", "");
        res.status(200).json({success:true, message:"Logout successfull"});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};

// ================  Admin's Controllers
export const findUser  = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {userIDOrEmailOrName} = req.body;

        console.log({userIDOrEmailOrName});

        const searchedUser = await User.find({
            $or:[
                {
                    name:{$regex:userIDOrEmailOrName, $options:"i"}
                },
                {
                    email:{$regex:userIDOrEmailOrName, $options:"i"}
                }
            ]
        });

        if (searchedUser.length === 0) return next(new ErrorHandler("User not found", 404));

        console.log({searchedUser});

        res.status(200).json({success:true, message:searchedUser});
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