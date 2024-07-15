import { Request, Response, NextFunction } from "express";
import Order from "../models/orderModel";
import { AuthenticatedUserRequest } from "../middlewares/auth";
import { ErrorHandler } from "../utils/utilities";


export const newOrder = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;
        const {orderItems, totalPrice, coupon, transactionId, status, shippingType, message}:{orderItems:{productID:string; quantity:number}[], totalPrice:number; coupon:string; transactionId:string; status:string; shippingType:string; message:string;} = req.body;

        console.log({orderItems, totalPrice, coupon, transactionId, status, shippingType, message});

        if (!userID) return(next(new ErrorHandler("userID not found", 404)));
        if (!totalPrice || !transactionId || !status || !shippingType) return(next(new ErrorHandler("something not found from orderController.ts", 404)));
        if (orderItems.length === 0) return(next(new ErrorHandler("productID not found", 404)));
        
        const order = await Order.create({
            userID,
            orderItems,
            paymentInfo:{
                transactionId,
                status,
                shippingType,
                message
            },
            coupon,
            totalPrice
        });
        
        if (!order) return(next(new ErrorHandler("Internal server error", 500)));

        res.status(200).json({success:true, message:"Order placed successfully"});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};