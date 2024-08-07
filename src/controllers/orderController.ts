import { Request, Response, NextFunction } from "express";
import Order from "../models/orderModel";
import { AuthenticatedUserRequest } from "../middlewares/auth";
import { ErrorHandler } from "../utils/utilities";
import Cart from "../models/cartModel";
import mongoose, { ObjectId } from "mongoose";
import Coupon from "../models/couponModel";


export const newOrder = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;
        const {orderItems, totalPrice, coupon, transactionId, status, shippingType, message, parent}:{orderItems:{productID:string; quantity:number}[], totalPrice:number; coupon:string; transactionId:string; status:string; shippingType:string; message:string; parent:string;} = req.body;
        const now = new Date();

        console.log({orderItems, totalPrice, coupon, transactionId, status, shippingType, message, parent});
        

        if (!userID) return(next(new ErrorHandler("userID not found", 404)));
        if (!totalPrice || !transactionId || !status || !shippingType) return(next(new ErrorHandler("something not found from orderController.ts", 404)));
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
                status,
                shippingType,
                message
            },
            coupon,
            totalPrice
        });
        
        if (!order) return(next(new ErrorHandler("Internal server error", 500)));

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
        res.status(200).json({success:true, message:"Order placed successfully"});
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
        
        const orders = await Order.find({userID}).populate({model:"Product", path:"orderItems.productID", select:"name price images"});
        console.log(orders);
        if (orders.length === 0) return next(new ErrorHandler("You have not ordered anything yet!", 204));

        res.status(200).json({success:true, message:orders});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};