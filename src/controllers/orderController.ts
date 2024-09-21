import { Request, Response, NextFunction } from "express";
import Order from "../models/orderModel";
import { AuthenticatedUserRequest } from "../middlewares/auth";
import { ErrorHandler } from "../utils/utilities";
import Cart from "../models/cartModel";
import mongoose from "mongoose";
import Coupon from "../models/couponModel";
import Review from "../models/reviewModel";
import { newActivity } from "../middlewares/userActivity.middleware";


export const newOrder = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;
        if (!userID) return(next(new ErrorHandler("userID not found", 404)));

        const {orderItems, totalPrice, coupon, transactionId, paymentStatus, orderStatus, shippingType, message, parent}:{orderItems:{productID:string; quantity:number}[], totalPrice:number; coupon:string; transactionId:string; paymentStatus:string; orderStatus:"pending"|"confirmed"|"processing"|"shipped"|"dispatched"|"delivered"|"cancelled"|"failed"|"returned"|"refunded"; shippingType:string; message:string; parent:string;} = req.body;
        await newActivity(userID, req, res, next, `order for orderItems-(${JSON.stringify(orderItems)}) transactionId-(${transactionId}) paymentStatus-(${paymentStatus}) orderStatus-(${orderStatus})`);

        const now = new Date();

        console.log({orderItems, totalPrice, coupon, transactionId, paymentStatus, orderStatus, shippingType, message, parent});
        

        if (!totalPrice || !transactionId || !shippingType) return(next(new ErrorHandler("something not found from orderController.ts", 404)));
        if (orderItems.length === 0) return(next(new ErrorHandler("productID not found", 404)));
        


        const usedCoupon = await Coupon.findById(coupon);

        if (usedCoupon) {
            if (now < usedCoupon.startedDate || now > usedCoupon.endDate) return next(new ErrorHandler("Coupon expired", 402));
            if (usedCoupon.usedCount >= usedCoupon.usageLimit) return next(new ErrorHandler("Coupon already used", 402));
            usedCoupon.usageLimit = usedCoupon.usageLimit - 1;
            usedCoupon.usedCount = usedCoupon.usedCount + 1;
        }

        await usedCoupon?.save();

        const order = await Order.create({
            userID,
            orderItems,
            paymentInfo:{
                transactionId,
                paymentStatus,
                shippingType,
                message
            },
            orderStatus,
            coupon,
            totalPrice
        });
        
        if (!order) return(next(new ErrorHandler("Internal server error", 500)));

        const arrayOfProductIDs = orderItems.map((product) => product.productID);

        await Review.updateMany({
            userID,
            productID:{$in:arrayOfProductIDs},
            isPurchaseVerified:false
        }, {$set:{isPurchaseVerified:true}});

        if (parent === "cart") {
            const cartProducts:{productID:mongoose.Types.ObjectId; quantity:number;}[] = [];
            const myCart = await Cart.findOne({userID});
            
            if (!myCart) return(next(new ErrorHandler("Cart not found", 404)));

            myCart.products.forEach((myCartItem) => {
                const findResult = orderItems.find((item) => item.productID === myCartItem.productID.toString());
                
                if (findResult) {
                    if (myCartItem.quantity - findResult.quantity > 0) {
                        cartProducts.push({
                            productID:myCartItem.productID,
                            quantity:(myCartItem.quantity - findResult.quantity)
                        });
                    }
                }
                else{
                    cartProducts.push({productID:myCartItem.productID, quantity:myCartItem.quantity})
                }
                
            });

            myCart.products = cartProducts;
            myCart.totalPrice = myCart.totalPrice - totalPrice;

            await myCart.save();
        }

        next({statusCode:200, data:{success:true, message:"Order placed successfully"}});
        //res.status(200).json({success:true, message:"Order placed successfully"});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const myOrders = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;

        console.log(userID);
        
        
        if (!userID) return next(new ErrorHandler("userID not found", 404));
        
        const orders = await Order.find({userID}).populate({model:"Product", path:"orderItems.productID", select:"name price images category"});
        //console.log(orders);
        //if (orders.length === 0) return next(new ErrorHandler(["You have not ordered anything yet!"], 204));

        res.status(200).json({success:true, message:orders});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const allOrders = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;
        
        if (!userID) return next(new ErrorHandler("userID not found", 404));
        
        const allOrders = await Order.find().populate({model:"Product", path:"orderItems.productID", select:"name price images category"});

        res.status(200).json({success:true, message:allOrders});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};