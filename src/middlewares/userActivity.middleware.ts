import { NextFunction, Request, Response } from "express";
//import { AuthenticatedUserRequest } from "../middlewares/auth";
import { ErrorHandler } from "../utils/utilities";
import UserActivity, { UserActivityType } from "../models/userActivityModel";
import mongoose from "mongoose";
import { AuthenticatedUserRequest } from "./auth";
import jsonwebtoken, { JwtPayload } from "jsonwebtoken";
import User from "../models/userModel";

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


export const newActivity = async(userID:mongoose.Schema.Types.ObjectId, req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            action,
            ipAddress,
            userAgent,
            userLocation,
            platform,
            device,
            referrer,
            success,
            errorDetails} = req.body;

        //const {activityID} = (req as AuthenticatedUserRequest).activity

        console.log({action, ipAddress, userAgent, userLocation, platform, device, referrer, success, errorDetails});
        

        console.log("------------- (1)");
        
        if (!action || !userLocation || !platform || !device || !referrer) return next(new ErrorHandler("all fields are required", 400));
        console.log("------------- (2)");
        
        if (!userID) return next(new ErrorHandler("userID not found", 404));
        const userActivity = await UserActivity.create({
            userID, action, userLocation, platform, device, referrer, success, errorDetails
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
        return res.status(400).json({success:false, message:"ERROR AAAA GAYA"});
    }
}
export const updateActivity = async(err:ErrorHandler, req:Request, res:Response, next:NextFunction) => {
    try {
        const activityID = (req as AuthenticatedUserRequest).activityID;
        if (err.message) {
            console.log("------------------ (14)");
            const updateUserActivity = await UserActivity.findByIdAndUpdate(activityID, {
                errorDetails:err.message
            });
            return next(new ErrorHandler(err.message, err.statusCode));
        }
        console.log("------------------ (11.1)");
        const {
            action,
            ipAddress,
            userAgent,
            userLocation,
            platform,
            device,
            referrer,
            success,
            errorDetails} = req.body;
        console.log("------------------ (11.2)");
        






        //const token = req.cookies?.userToken;
        const token = (req as AuthenticatedUserRequest).token || req.cookies?.userToken;

        console.log({cookie:token});
        

        if (!token) return next(new ErrorHandler("Token not found", 404));

        const verifyToken = jsonwebtoken.verify(token, "thisissecret") as JwtPayload;

        const loggedInUser = await User.findById(verifyToken.id);

        if (!loggedInUser) return next(new ErrorHandler("User not found from auth.js", 404));







        const userID = loggedInUser._id;
        console.log("------------------ (12)");

        console.log({action, ipAddress, userAgent, userLocation, platform, device, referrer, success, errorDetails});
        
        
        if (!activityID) return next(new ErrorHandler("activityID not found", 404));
        if (!userID) return next(new ErrorHandler("userID not found", 404));
        if (!action || !userLocation || !platform || !device || !referrer) return next(new ErrorHandler("all fields are required", 400));
        console.log("------------------ (13)");
        
        
        if (err.message) {
            console.log("------------------ (14)");
            const updateUserActivity = await UserActivity.findByIdAndUpdate(activityID, {
                errorDetails:err.message
            });
        }
        else{
            console.log("------------------ (15)");
            const updateUserActivity = await UserActivity.findByIdAndUpdate(activityID, {
                success:true
            });
        }
        
        res.status(200).json({success:true, message:`user activity added for ${action}`})
    } catch (error) {
        console.log("------------------ (16)");
        console.log(error);
        next(error)
    }
}