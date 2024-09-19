import { NextFunction, Request, Response } from "express";
//import { AuthenticatedUserRequest } from "../middlewares/auth";
import { ErrorHandler } from "../utils/utilities";
import UserActivity, { UserActivityType } from "../models/userActivityModel";
import mongoose from "mongoose";
import { AuthenticatedUserRequest } from "./auth";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import User from "../models/userModel";
import { UserLocationTypes } from "../controllers/userController";

export interface UserActivityFormType{
    userID: mongoose.Schema.Types.ObjectId;
    action: string;
    ipAddress: string;
    userAgent: string;
    userLocation: string;
    platform: string;
    device: string;
    referrer: string;
    success: boolean;
    errorDetails: string;
};

interface NextResposeData{
    data:{
        message:string;
    };
}

export const newActivity = async(
    userID:mongoose.Schema.Types.ObjectId|null,
    req:Request<{}, {}, {email:string; password:string; action:string; userLocation:UserLocationTypes;}>,
    res:Response,
    next:NextFunction,
    message?:string
) => {
    try {
        const {action, userLocation} = req.body;
        //const ipAddress = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
        const ipAddress = userLocation.ip;
        const userAgent = req.headers["user-agent"];
        const referrer = req.headers.referer;

        console.log("JJJJJJJJJJJJJJJJJJJJJJJJJ");
        console.log({action, userLocation});
        console.log("JJJJJJJJJJJJJJJJJJJJJJJJJ");
        
        
        const getDeviceType = (userAgent:string) => {
            // Convert the userAgent string to lowercase for case-insensitive comparison
            const ua = userAgent.toLowerCase();
        
            // Check for mobile devices
            if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
                return 'Mobile';
            }
        
            // Check for tablets
            if (/tablet|ipad/.test(ua)) {
                return 'Tablet';
            }
        
            // Default to desktop for anything else
            return 'Desktop';
        }
        console.log(getDeviceType(userAgent as string));
        
        const getPlatformName = (userAgent: string) => {
            if (/windows/i.test(userAgent)) {
                return 'Windows';
            } else if (/macintosh|mac os x/i.test(userAgent)) {
                return 'macOS';
            } else if (/linux/i.test(userAgent)) {
                return 'Linux';
            } else if (/android/i.test(userAgent)) {
                return 'Android';
            } else if (/iphone|ipad|ipod/i.test(userAgent)) {
                return 'iOS';
            } else {
                return 'Unknown';
            }
        };
        console.log(getPlatformName(userAgent as string));
        
        
        
    
        const platform = getPlatformName(userAgent as string);
        const device = getDeviceType(userAgent as string);
    

        console.log({action, ipAddress, userAgent, userLocation, platform, device, referrer});
        

        console.log("------------- (1)");
        
        if (!action || !userLocation || !platform || !device || !referrer) return next(new ErrorHandler("all fields are required", 400));
        console.log("------------- (2)");
        
        //if (!userID) return next(new ErrorHandler("userID not found", 404));
        const userActivity = await UserActivity.create({
            userID, action, userLocation, platform, device, referrer, message
        });
        console.log("------------- (3)");
        
        if (!userActivity) return next(new ErrorHandler("Internal Server Error", 500));
        console.log("------------- (4)");
        console.log({userActivity:userActivity._id});
        console.log("------------- (5)");
        
        (req as AuthenticatedUserRequest).activityID = userActivity?._id;
        console.log("------------- (6)");
        
        return userID;
    } catch (error) {
        console.log("------------- (7)");
        console.log(error);
        next(error);
        //return res.status(400).json({success:false, message:"ERROR AAAA GAYA"});
    }
}
export const updateActivity = async(nextRes:(ErrorHandler&NextResposeData), req:Request<{}, {}, {email:string; password:string; action:string; userLocation:UserLocationTypes;}>, res:Response, next:NextFunction) => {
    console.log("OOOOOOOOOOOOOOOOOOOOOO1");
    console.log(nextRes);
    console.log("OOOOOOOOOOOOOOOOOOOOOO2");
    
    
    try {
        const {action, userLocation} = req.body;
        const activityID = (req as AuthenticatedUserRequest).activityID;
        const ipAddress = userLocation.ip;
        const userAgent = req.headers["user-agent"];
        const referrer = req.headers.referer;
        
        console.log({ipAddress, userAgent, referrer});
        

        const getDeviceType = (userAgent:string) => {
            // Convert the userAgent string to lowercase for case-insensitive comparison
            const ua = userAgent.toLowerCase();
        
            // Check for mobile devices
            if (/mobile|android|iphone|ipad|ipod/.test(ua)) {
                return 'Mobile';
            }
        
            // Check for tablets
            if (/tablet|ipad/.test(ua)) {
                return 'Tablet';
            }
        
            // Default to desktop for anything else
            return 'Desktop';
        }
        const getPlatformName = (userAgent: string) => {
            if (/windows/i.test(userAgent)) {
                return 'Windows';
            } else if (/macintosh|mac os x/i.test(userAgent)) {
                return 'macOS';
            } else if (/linux/i.test(userAgent)) {
                return 'Linux';
            } else if (/android/i.test(userAgent)) {
                return 'Android';
            } else if (/iphone|ipad|ipod/i.test(userAgent)) {
                return 'iOS';
            } else {
                return 'Unknown';
            }
        };

        console.log({plateform:getPlatformName(userAgent as string), userLocation:"faridabad", device:getDeviceType(userAgent as string)});

    
        const platform = getPlatformName(userAgent as string);
        const device = getDeviceType(userAgent as string);
    








        if (nextRes.message) {
            console.log("------------------ (14)");
            console.log({activityID});
            
            const updateUserActivity = await UserActivity.findByIdAndUpdate(activityID, {
                errorDetails:nextRes.message,
                status:"failed"
            });
            return next(new ErrorHandler(nextRes.message, nextRes.statusCode));
        }
        console.log("------------------ (11.1)");
        






        //const token = req.cookies?.userToken;
        const token = (req as AuthenticatedUserRequest).token || req.cookies?.userToken;

        console.log({cookie:token});
        

        if (!token) return next(new ErrorHandler("Token not found", 404));

        const verifyToken = jsonwebtoken.verify(token, "thisissecret") as JwtPayload;

        const loggedInUser = await User.findById(verifyToken.id);

        if (!loggedInUser) return next(new ErrorHandler("User not found from auth.js", 404));







        const userID = loggedInUser._id;
        console.log("------------------ (12)");

        console.log({action, ipAddress, userAgent, userLocation, platform, device, referrer, errorDetails:nextRes.message});
        
        
        if (!activityID) return next(new ErrorHandler("activityID not found", 404));
        //if (!userID) return next(new ErrorHandler("userID not found", 404));
        //if (!action || !userLocation || !platform || !device || !referrer) return next(new ErrorHandler("all fields are required", 400));
        console.log("------------------ (13)");
        
        
        if (nextRes.message) {
            console.log("------------------ (14)");
            const updateUserActivity = await UserActivity.findByIdAndUpdate(activityID, {
                errorDetails:nextRes.message,
                status:"failed"
            });
        }
        else{
            console.log("------------------ (15)");
            const updateUserActivity = await UserActivity.findByIdAndUpdate(activityID, {
                //success:true,
                status:"succeeded"
            });
        }
        
        res.status(nextRes.statusCode).json({success:true, message:nextRes.data.message});
    } catch (error) {
        console.log("------------------ (16)");
        console.log(error);
        next(error)
    }
}