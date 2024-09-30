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
        const {skip} = req.body;
        const userID = (req as AuthenticatedUserRequest).user._id;
        
        const ordersCount = await Order.countDocuments({userID});


        if (skip === undefined) return next(new ErrorHandler("skip not found", 200));
        if (!userID) return next(new ErrorHandler("userID not found", 404));
        
        const orders = await Order.find({userID}).populate({model:"Product", path:"orderItems.productID", select:"name price images category"})
                            .skip(Number(skip))
                            .limit(5);

        res.status(200).json({success:true, message:{orders, ordersCount}});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const allOrders = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;
        
        if (!userID) return next(new ErrorHandler("userID not found", 404));
        
        const [
            allPendingOrders,
            allConfirmedOrders,
            allProcessingOrders,
            allDispatchedOrders,
            allShippedOrders,
            allDeliveredOrders,
            allCancelledOrders,
            allFailedOrders,
            allReturnedOrders,
            allRefundedOrders
        ] = await Promise.all([
            Order.find({orderStatus:"pending"}).populate({model:"Product", path:"orderItems.productID", select:"name price images category"}),
            Order.find({orderStatus:"confirmed"}).populate({model:"Product", path:"orderItems.productID", select:"name price images category"}),
            Order.find({orderStatus:"processing"}).populate({model:"Product", path:"orderItems.productID", select:"name price images category"}),
            Order.find({orderStatus:"dispatched"}).populate({model:"Product", path:"orderItems.productID", select:"name price images category"}),
            Order.find({orderStatus:"shipped"}).populate({model:"Product", path:"orderItems.productID", select:"name price images category"}),
            Order.find({orderStatus:"delivered"}).populate({model:"Product", path:"orderItems.productID", select:"name price images category"}),
            Order.find({orderStatus:"cancelled"}).populate({model:"Product", path:"orderItems.productID", select:"name price images category"}),
            Order.find({orderStatus:"failed"}).populate({model:"Product", path:"orderItems.productID", select:"name price images category"}),
            Order.find({orderStatus:"returned"}).populate({model:"Product", path:"orderItems.productID", select:"name price images category"}),
            Order.find({orderStatus:"refunded"}).populate({model:"Product", path:"orderItems.productID", select:"name price images category"})
        ]);

        //console.log({allPendingOrders});
        //console.log({allConfirmedOrders});
        //console.log({allProcessingOrders});
        //console.log({allDispatchedOrders});
        //console.log({allShippedOrders});
        //console.log({allDeliveredOrders});
        //console.log({allCancelledOrders});
        //console.log({allFailedOrders});
        //console.log({allReturnedOrders});
        //console.log({allRefundedOrders});
        

        res.status(200).json({success:true, message:{allPendingOrders, allConfirmedOrders, allProcessingOrders, allDispatchedOrders, allShippedOrders, allDeliveredOrders, allCancelledOrders, allFailedOrders, allReturnedOrders, allRefundedOrders}});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const updateOrder = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;
        const {orderID, orderStatus} = req.body;

        console.log(userID);
        console.log({orderID, orderStatus});
        
        
        if (!userID) return next(new ErrorHandler("userID not found", 404));
        if (!orderID || !orderStatus) return next(new ErrorHandler("all fields are required", 400));
        
        const orders = await Order.findByIdAndUpdate(orderID, {
            orderStatus
        });
        //.populate({model:"Product", path:"orderItems.productID", select:"name price images category"});
        //console.log(orders);
        //if (orders.length === 0) return next(new ErrorHandler(["You have not ordered anything yet!"], 204));

        res.status(200).json({success:true, message:"orderStatus updated"});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const removeProductFormOrder = async(req:Request<{}, {}, {orderID:string; productID:string; removingProductPrice:number; removingProductQuantity:number;}>, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;
        const {orderID, productID, removingProductPrice, removingProductQuantity} = req.body;

        //console.log(userID);
        //console.log({orderID, productID, removingProductPrice, removingProductQuantity});
        
        
        if (!userID) return next(new ErrorHandler("userID not found", 404));
        if (!orderID || !productID) return next(new ErrorHandler("all fields are required", 400));

        const order = await Order.findByIdAndUpdate(orderID, {
            $pull:{
                orderItems:{
                    productID
                }
            },
            $inc:{
                totalPrice:-(removingProductPrice*removingProductQuantity)
            }
        }, {new:true});
        const savingRevomedProductAsNew = await Order.create({
            userID,
            orderItems:[{productID, quantity:removingProductQuantity}],
            orderStatus:"cancelled",
            totalPrice:removingProductPrice,
            paymentInfo:order?.paymentInfo
        })
        
        res.status(200).json({success:true, message:{order, savingRevomedProductAsNew}});
    } catch (error) {
        console.log(error);
        next(error);
    }
};