import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import {ErrorHandler, sendToken} from "../utils/utilities";
import { AuthenticatedUserRequest } from "../middlewares/auth";
import mongoose from "mongoose";
import { VERIFY } from "../constants/constants";
import sendMail from "../utils/mailer.util";


export const register = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name, email, password, avatar, mobile}:{name:string; email:string; password:string; avatar:string; mobile:string;} = req.body;

        console.log({name, email, password, avatar, mobile});

        const isUserExist = await User.findOne({email});
        
        console.log({isUserExist});

        if (isUserExist) return next(new ErrorHandler("User already exists", 401));

        const newUser = await User.create({
            name, email, password, avatar, mobile
        });

        if (!newUser) return next(new ErrorHandler("Internal Server Error", 500));

        await sendToken(newUser, res, next);
        
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

        if (isUserExist.emailVerified === true) {
            await sendToken(isUserExist, res, next);
            return res.status(200).json({success:true, message:"Login successfull"});
        }
        else{
            sendMail(isUserExist.email, VERIFY, isUserExist._id, next)
            return res.status(200).json({success:true, message:"Now verify your email"});
        }

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
        const {name, email, password, mobile, house, street, city, state, zip} = req.body;
        const user = (req as AuthenticatedUserRequest).user;

        if (!user) return next(new ErrorHandler("user not found", 404));

        const isAddressExist = user.address.find((item) => item.house === house && item.street === street && item.city === city && item.state === state && item.zip === zip);

        if (isAddressExist) {
            const updateMe = await User.findByIdAndUpdate(user._id, {
                ...(name&&{name}),
                ...(email&&{email}),
                ...(password&&{password}),
                ...(mobile&&{mobile})
            });
            
            if (!updateMe) return next(new ErrorHandler("Internal Server Error", 500));
        }
        else{
            const updateMe = await User.findByIdAndUpdate(user._id, {
                ...(name&&{name}),
                ...(email&&{email}),
                ...(password&&{password}),
                ...(mobile&&{mobile}),
                ...(street&&city&&state&&zip&&{$push:{address:{house, street, city, state, zip}}})
            });

            if (!updateMe) return next(new ErrorHandler("Internal Server Error", 500));
        }

        res.status(200).json({success:true, message:updateMe});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const removeAddress  = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {house, street, city, state, zip} = req.body;
        const userID = (req as AuthenticatedUserRequest).user;

        console.log({house, street, city, state, zip});
        
        if (!house && !street && !city && !state && !zip) return next(new ErrorHandler("Body for remove address is empty", 404));
        if (!userID) return next(new ErrorHandler("userID not found", 404));
        
        const user = await User.findByIdAndUpdate(userID, {$pull:{
            address:{house, street, city, state, zip}
        }});
        
        if (!user) return next(new ErrorHandler("user not found", 404));

        res.status(200).json({success:true, message:"Address removed"});
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
export const addToWishlist  = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productID} = req.params;

        if (!productID) return next(new ErrorHandler("productID not found", 404));

        const user = await User.findById((req as AuthenticatedUserRequest).user._id);

        const isWishlistedProduct = user?.wishlist.find((productId) => productId.toString() === productID);

        if (!isWishlistedProduct) {
            user?.wishlist.push(new mongoose.Types.ObjectId(productID));

            await user?.save();

            return res.status(200).json({success:true, message:"Added to wishlist"});
        }
        else{
            const productRemovedfromWishlist = await User.findByIdAndUpdate((req as AuthenticatedUserRequest).user._id, {$pull:{wishlist:new mongoose.Types.ObjectId(productID)}})

            if (!productRemovedfromWishlist) return next(new ErrorHandler("Internal Server Error", 500));

            return res.status(200).json({success:true, message:"Removed from wishlist"});
        }

    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const myWishlist  = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;
        if (!userID) return next(new ErrorHandler("userID not found", 404));
        const user = await User.findById(userID).populate({model:"Product", path:"wishlist", select:"category name price rating description images"});
        if (!user) return next(new ErrorHandler("user not found", 404));

        res.status(200).json({success:true, message:user.wishlist})

    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const verifyEmail  = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {verificationToken, emailType}:{verificationToken:string; emailType:string;} = req.body;

        console.log({verificationToken, emailType});
        
        if (emailType === VERIFY) {
            const user = await User.findOne({verificationToken, verificationTokenExpires:{$gt:Date.now()}});
    
            if (!user) return next(new ErrorHandler("User not found", 404));
            if (user.verificationToken === undefined) return next(new ErrorHandler("verificationToken not found", 404));
            
            user.verificationToken = undefined;
            user.verificationTokenExpires = undefined;
            user.emailVerified = true;

            await user.save();

            await sendToken(user, res, next);

            return res.status(200).json({success:true, message:"Email verified successfully"});
        }
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