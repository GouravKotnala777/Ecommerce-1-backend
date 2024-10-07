import { NextFunction, Request, Response } from "express";
import Coupon from "../models/couponModel";
import { ErrorHandler, generateCoupon } from "../utils/utilities";
import Cart from "../models/cartModel";
import { AuthenticatedUserRequest } from "../middlewares/auth";
import { newActivity } from "../middlewares/userActivity.middleware";
import User from "../models/userModel";


export const createCoupon = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;

        if (!userID) return next(new ErrorHandler("userID not found", 404));

        await newActivity(userID, req, res, next);

        const {discountType, amount, minPerchaseAmount, startedDate, endDate, usageLimit, usedCount} = req.body;

        console.log({discountType, amount, minPerchaseAmount, startedDate, endDate, usageLimit, usedCount});
        
        if (!discountType || !amount || !startedDate || !endDate) return next(new ErrorHandler("All fields are required", 400));
        
        const code = generateCoupon();

        console.log({code});
        
        
        if (!code) return next(new ErrorHandler("Coupon not generated", 500));
        
        const coupon = await Coupon.create({
            code,
            discountType,
            amount,
            minPerchaseAmount,
            startedDate,
            endDate,
            usageLimit,
            usedCount
        });

        if (!coupon) return(next(new ErrorHandler("Internal server error", 500)));

        next({statusCode:200, data:{success:true, message:"Coupon created successfully"}});
        //res.status(200).json({success:true, message:"Coupon created successfully"});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const allCoupons = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const coupons = await Coupon.find();

        if (!coupons) return(next(new ErrorHandler("Coupons not found", 404)));

        res.status(200).json({success:true, message:coupons});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const myCoupons = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;
        const loggedInUser = await User.findById(userID).populate({model:"Coupon", path:"coupons", select:"_id code discountType amount minPerchaseAmount startedDate endDate usageLimit usedCount"});
        
        if (!loggedInUser) return(next(new ErrorHandler("user not found", 404)));
        
        const myCoupons = loggedInUser.coupons;

        //if (!coupons) return(next(new ErrorHandler("Coupons not found", 404)));


        res.status(200).json({success:true, message:myCoupons});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const singleCoupon = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {code}:{code:string;} = req.body;
        const userID = (req as AuthenticatedUserRequest).user._id;
        const now = new Date();

        console.log({code, now});
        
        
        if (!code) return(next(new ErrorHandler("Code not found", 400)));
        
        const coupon = await Coupon.findOne({code});
        
        if (!coupon) return(next(new ErrorHandler("Coupon not found", 404)));
        
        // iska status code sahi karna hai
        if (now < coupon.startedDate || now > coupon.endDate) return next(new ErrorHandler("Coupon expired", 402));
        if (coupon.usedCount >= coupon.usageLimit) return next(new ErrorHandler("Coupon already used", 402));
        if (!userID) return next(new ErrorHandler("userId not found", 404));
        
        const myCart = await Cart.findOne({userID})
        if (!myCart) return next(new ErrorHandler("myCart not found", 404));

        if (coupon.minPerchaseAmount > myCart?.totalPrice) return next(new ErrorHandler(`Minimun total amount should be ${coupon.minPerchaseAmount} but your cart's total amount is ${myCart.totalPrice}`, 402));

        res.status(200).json({success:true, message:coupon});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};