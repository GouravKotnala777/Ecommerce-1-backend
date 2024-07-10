import { Request, Response, NextFunction } from "express";
import Order from "../models/orderModel";
import { AuthenticatedUserRequest } from "../middlewares/auth";
import { ErrorHandler } from "../utils/utilities";


export const newOrder = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;
        const orderItems:{productID:string; quantity:number}[] = req.body;

        if (!userID) return(next(new ErrorHandler("userID not found", 404)));
        if (orderItems.length === 0) return(next(new ErrorHandler("productID not found", 404)));
        
        const order = await Order.find({
            userID,
            orderItems,
            paymentInfo:{
                transactionId:"demo transactionID",
                status:"status",
                shippingType:"sssss",
                message:"aaaaa"
            },
            totalPrice:69696969
        });
        
        if (!order) return(next(new ErrorHandler("Internal server error", 500)));

        res.status(200).json({success:true, message:"Order placed successfully"});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};