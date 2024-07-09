import { NextFunction, Request, Response } from "express";
import Coupon from "../models/couponModel";
import { ErrorHandler, generateCoupon } from "../utils/utilities";


export const createCoupon = async(req:Request, res:Response, next:NextFunction) => {
    try {
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

        res.status(200).json({success:true, message:"Coupon created successfully"});
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