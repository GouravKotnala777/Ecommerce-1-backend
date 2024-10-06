import { NextFunction, Request, Response } from "express";
import User from "../models/userModel";
import {cookieOptions, ErrorHandler, generateCoupon, sendToken} from "../utils/utilities";
import { AuthenticatedUserRequest } from "../middlewares/auth";
import mongoose from "mongoose";
import { RESET_PASSWORD, VERIFY } from "../constants/constants";
import sendMail from "../utils/mailer.util";
import bcryptjs from "bcryptjs";
import { newActivity } from "../middlewares/userActivity.middleware";
import UserActivity from "../models/userActivityModel";
//import sendSMS from "../utils/sendSMS.util";
import Coupon from "../models/couponModel";
//import { newActivity } from "../utils/userActivity.util";


export interface UserLocationTypes {
    city?:string;
    country?:string;
    ip?:string;
    loc?:string;
    org?:string;
    postal?:string;
    readme?:string;
    region?:string;
    timezone?:string;
}



export const register = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name, email, password, avatar, mobile, referrerUserID}:{name:string; email:string; password:string; avatar:string; mobile:string; referrerUserID?:string} = req.body;
        //const {referrerUserID}:{referrerUserID?:string} = req.query;

        console.log({referrerUserID});
        


        const isUserExist = await User.findOne({email});
        

        if (isUserExist) return next(new ErrorHandler("User already exists", 401));

        const newUser = await User.create({
            name, email, password, avatar, mobile
        });

        if (!newUser) return next(new ErrorHandler("Internal Server Error", 500));

        await sendMail(newUser.email, VERIFY, newUser._id, next, referrerUserID);
        await sendToken(newUser, res, next);
        
        res.status(200).json({success:true, message:"Now verify your email"});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const login  = async(req:Request<{}, {}, {email:string; password:string; action:string; userLocation:UserLocationTypes;}>, res:Response, next:NextFunction) => {
    try {
        const {email, password} = req.body;
        
        const isUserExist = await User.findOne({email});
        
        if (!email) return (next(new ErrorHandler("Wrong email or password 0", 404)));
        if (!isUserExist) return (next(new ErrorHandler("Wrong email or password 1", 404)));
        //if (!action || !ipAddress || !userAgent || !userLocation || !platform || !device || !referrer) return (next(new ErrorHandler("Activity detailes are not provided", 400)));
        console.log("SSSSSSSSSSSSSSSSS");
        
        await newActivity(isUserExist._id, req, res, next);
        //if (!email || !password) return (next(new ErrorHandler("All fields are required", 400)));
        console.log("------------------ (8)");
        
        const isPasswordMatched = await isUserExist.comparePassword(password);
        console.log("------------------ (9)");
        
        if (!isPasswordMatched) return (next(new ErrorHandler("Wrong email or password 2", 404)));
        console.log("------------------ (10)");
        
        if (isUserExist.emailVerified === true) {
            console.log("------------------ (10.1)");
            const sendTokenReturnedValue = await sendToken(isUserExist, res, next);
            
            console.log("-------------- login ho gaya");
            (req as AuthenticatedUserRequest).token = sendTokenReturnedValue as string; 
            next({statusCode:200, data:{success:true, message:"Login successfull"}});
            //return res.status(200).json({success:true, message:"Login successfull"});
        }
        else{
            console.log("------------------ (10.2)");
            sendMail(isUserExist.email, VERIFY, isUserExist._id, next)
            return res.status(200).json({success:true, message:"Now verify your email"});
        }
        
    } catch (error) {
        console.log("------------------ (11.0 error)");
        //await newActivity("", {userID:isUserExist._id, action, ipAddress, userAgent, userLocation, platform, device, referrer, success, errorDetails}, res, next);
        console.log(error);
        next(error);
    }
};
//export const login  = async(req:Request, res:Response, next:NextFunction) => {
//    try {
//        const {email, password,
//            action, ipAddress, userAgent, userLocation, platform, device, referrer, success, errorDetails
//        }:{
//            email:string; password:string;
//            action:string; ipAddress:string; userAgent:string; userLocation:string; platform:string; device:string; referrer:string; success:boolean; errorDetails:string;
//        } = req.body;
//        const isUserExist = await User.findOne({email});
//        if (!isUserExist) return (next(new ErrorHandler("Wrong email or password 1", 404)));
//        if (!action || !ipAddress || !userAgent || !userLocation || !platform || !device || !referrer) return (next(new ErrorHandler("Activity detailes are not provided", 400)));
        
//        await newActivity(isUserExist._id, req, res, next);
//        //if (!email || !password) return (next(new ErrorHandler("All fields are required", 400)));
//        console.log("------------------ (8)");
        
//        const isPasswordMatched = await isUserExist.comparePassword(password);
//        console.log("------------------ (9)");
        
//        if (!isPasswordMatched) return (next(new ErrorHandler("Wrong email or password 2", 404)));
//        console.log("------------------ (10)");
        
//        if (isUserExist.emailVerified === true) {
//            console.log("------------------ (11)");
//            await sendToken(isUserExist, res, next);
            
//            console.log("-------------- login ho gaya");
            
//            next(new ErrorHandler("", 400));
//            //return res.status(200).json({success:true, message:"Login successfull"});
//        }
//        else{
//            console.log("------------------ (11.0)");
//            sendMail(isUserExist.email, VERIFY, isUserExist._id, next)
//            return res.status(200).json({success:true, message:"Now verify your email"});
//        }
        
//    } catch (error) {
//        console.log("------------------ (11.0 error)");
//        //await newActivity("", {userID:isUserExist._id, action, ipAddress, userAgent, userLocation, platform, device, referrer, success, errorDetails}, res, next);
//        console.log(error);
//        next(error);
//    }
//};
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
        console.log("------------ (1)");
        
        const {oldPassword, name, email, password, mobile, house, street, city, state, zip} = req.body;
        const user = (req as AuthenticatedUserRequest).user;
        console.log({oldPassword, name, email, password, mobile, house, street, city, state, zip});
        
        console.log("------------ (2)");
        
        if (!user) return next(new ErrorHandler("user not found", 404));
        console.log("------------ (3)");
        
        await newActivity(user._id, req, res, next, `update name-(${name}) email-(${email}) mobile-(${mobile}) house-(${house}) street-(${street}) city-(${city}) state-(${state}) zip-(${zip})`);
        console.log("------------ (3.1)");
        
        const isAddressExist = user.address.find((item) => item.house === house && item.street === street && item.city === city && item.state === state && item.zip === zip);
        console.log("------------ (3.2)");
        if (!house && !street && !city && !state && !zip) {
                console.log("------------ (3.3)");
                if (!oldPassword)  return next(new ErrorHandler("old password is undefined", 400));
                console.log("------------ (3.4)");
                const isPasswordMatched = await bcryptjs.compare(oldPassword, user.password);
                console.log("------------ (3.5)");
                if (!isPasswordMatched)  return next(new ErrorHandler("wrong email or password", 401));
                console.log("------------ (3.6)");
                const updateMe = await User.findByIdAndUpdate(user._id, {
                    ...(name&&{name}),
                    ...(email&&{email}),
                    ...(password&&{password:await bcryptjs.hash(password, 6)}),
                    ...(mobile&&{mobile})
                });
                
                console.log("------------ (3.7)");
                if (!updateMe) return next(new ErrorHandler("Internal Server Error", 500));
                
                console.log(updateMe);
                console.log("------------ (3.8)");
        }
        else{
            if (!isAddressExist) {
                const updateMe = await User.findByIdAndUpdate(user._id, {
                    //...(name&&{name}),
                    //...(email&&{email}),
                    //...(password&&{password:await bcryptjs.hash(password, 6)}),
                    //...(mobile&&{mobile}),
                    ...(street&&city&&state&&zip&&{$push:{address:{house, street, city, state, zip}}})
                });
                
                console.log("------------ (3.1011)");
                if (!updateMe) return next(new ErrorHandler("Internal Server Error", 500));
            }
        }
        
        console.log("------------ (3.11)");
        next({statusCode:200, data:{success:true, message:"Profile updated successfully"}});
        //res.status(200).json({success:true, message:updateMe});
    } catch (error) {
        console.log("------------ (3.12)");
        console.log(error);
        next(error);        
    }
};
export const forgetPassword  = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {email} = req.body;
        console.log({email});
        
        if (!email) return next(new ErrorHandler("Please provide email", 401));

        const user = await User.findOne({email, emailVerified:true});

        if (!user) return next(new ErrorHandler("User not found", 404));

        await newActivity(user._id, req, res, next, `email-(${email})`);

        const aa = sendMail(user.email, RESET_PASSWORD, user._id, next);
        console.log({aa});

        next({statusCode:200, data:{success:true, message:`A verification message has sent to this email ${email}`}});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const removeAddress  = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {house, street, city, state, zip} = req.body;
        const userID = (req as AuthenticatedUserRequest).user._id;
        if (!house && !street && !city && !state && !zip) return next(new ErrorHandler("Body for remove address is empty", 404));
        if (!userID) return next(new ErrorHandler("userID not found", 404));

        await newActivity(userID, req, res, next, `house-(${house}), street-(${street}), city-(${city}), state-(${state}), zip-(${zip})`);
        
        
        const user = await User.findByIdAndUpdate(userID, {$pull:{
            address:{house, street, city, state, zip}
        }});
        
        if (!user) return next(new ErrorHandler("user not found", 404));

        next({statusCode:200, data:{success:true, message:"Address removed"}});
        //res.status(200).json({success:true, message:"Address removed"});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const logout  = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const user = (req as AuthenticatedUserRequest).user;

        if (!user) return next(new ErrorHandler("user not found", 404));

        await newActivity(user._id, req, res, next);

        res.cookie("userToken", "", cookieOptions);
        next({statusCode:200, data:{success:true, message:"Logout successfull"}});
        //res.status(200).json({success:true, message:"Logout successfull"});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const addToWishlist  = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productID} = req.params;
        const userID = (req as AuthenticatedUserRequest).user._id;
        if (!userID) return next(new ErrorHandler("userID not found", 404));

        await newActivity(userID, req, res, next, `add/remove productID-(${productID}) from wishlist`);

        if (!productID) return next(new ErrorHandler("productID not found", 404));

        const user = await User.findById(userID);

        const isWishlistedProduct = user?.wishlist.find((productId) => productId.toString() === productID);

        if (!isWishlistedProduct) {
            user?.wishlist.push(new mongoose.Types.ObjectId(productID));

            await user?.save();

            next({statusCode:200, data:{success:true, message:"Added to wishlist"}});
            //return res.status(200).json({success:true, message:"Added to wishlist"});
        }
        else{
            const productRemovedfromWishlist = await User.findByIdAndUpdate((req as AuthenticatedUserRequest).user._id, {$pull:{wishlist:new mongoose.Types.ObjectId(productID)}})

            if (!productRemovedfromWishlist) return next(new ErrorHandler("Internal Server Error", 500));

            next({statusCode:200, data:{success:true, message:"Removed from wishlist"}});
            //return res.status(200).json({success:true, message:"Removed from wishlist"});
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
        const {verificationToken, emailType, newPassword,
            action, ipAddress, userAgent, location, platform, device, referrer,
            referrerUserID
        }:{verificationToken:string; emailType:string; newPassword:string;
            action:string; ipAddress:string; userAgent:string; location:string; platform:string; device:string; referrer:string; success:boolean; errorDetails?:string;
            referrerUserID?:string;
        } = req.body;
        
        if (emailType === VERIFY) {
            const user = await User.findOne({verificationToken, verificationTokenExpires:{$gt:Date.now()}});
    
            if (!user) return next(new ErrorHandler("User not found", 404));


            await newActivity(user._id, req, res, next, `verify for emailType-(${emailType}) `);


            if (referrerUserID) {
                console.log("UPER WALE SE referrerUserID");
                
                const referedUser = await User.findById(referrerUserID);

                if (!referedUser) return next(new ErrorHandler("Refered user not found", 404));


                if (user.verificationToken === undefined) return next(new ErrorHandler("verificationToken not found", 404));
                if (!action || !ipAddress || !userAgent || !location || !platform || !device || !referrer) return (next(new ErrorHandler("Activity detailes are not provided", 400)));

                const newCoupon = await Coupon.create({
                    amount:100,
                    code:generateCoupon(),
                    discountType:"fixed",
                    startedDate:Date.now(),
                    endDate:Date.now()+2,
                    minPerchaseAmount:200,
                    usageLimit:1
                });

                referedUser.referedUsers.push({
                    userID:user._id,
                    coupon:newCoupon._id,
                    status:"pending"
                });

                user.verificationToken = undefined;
                user.verificationTokenExpires = undefined;
                user.emailVerified = true;

                await user.save();
                await referedUser.save();
                await sendToken(user, res, next);

                next({statusCode:200, data:{success:true, message:"Email verified successfully"}});
            }
            else{
                console.log("NICHE WALE SE referrerUserID");

                if (user.verificationToken === undefined) return next(new ErrorHandler("verificationToken not found", 404));
                if (!action || !ipAddress || !userAgent || !location || !platform || !device || !referrer) return (next(new ErrorHandler("Activity detailes are not provided", 400)));

                user.verificationToken = undefined;
                user.verificationTokenExpires = undefined;
                user.emailVerified = true;

                await user.save();
                await sendToken(user, res, next);

                next({statusCode:200, data:{success:true, message:"Email verified successfully"}});
            }


        }
        else if (emailType === RESET_PASSWORD) {
            const user = await User.findOne({resetPasswordToken:verificationToken, resetPasswordExpires:{$gt:Date.now()}});

            if (!user) return next(new ErrorHandler("User not found", 404));

            await newActivity(user._id, req, res, next, `verify for emailType-(${emailType}) `)

            if (user.resetPasswordToken === undefined) return next(new ErrorHandler("resetPasswordToken not found", 404));
            
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            user.password = newPassword;

            await user.save();

            await sendToken(user, res, next);

            next({statusCode:200, data:{success:true, message:"Password updated successfully"}});
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
};
//export const sendReferralSMS  = async(req:Request, res:Response, next:NextFunction) => {
//    try {
//        const {toPhoneNumber, messageURL} = req.body;

//        if (!toPhoneNumber || !messageURL) return next(new ErrorHandler("all fields are required", 400));

//        await sendSMS(req, res, next, toPhoneNumber, messageURL);

//        res.status(200).json({success:true, message:"OTP has been sent"})
//    } catch (error) {
//        console.log(error);
//        next(error);
//    }
//};
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
export const allUsersActivities  = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {skip} = req.body;

        console.log({skip});
        
        if (skip === undefined) return next(new ErrorHandler("skip not found", 200));
        
        const activityCount = await UserActivity.countDocuments();
        const activity = await UserActivity.find()
                            .skip(Number(skip))
                            .limit(5);

        if (activity.length === 0) return next(new ErrorHandler("No User Activities found", 200));

        res.status(200).json({success:true, message:{activity, activityCount}});
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