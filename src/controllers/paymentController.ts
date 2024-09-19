import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utilities";
import { stripe } from "../app";
import { newActivity } from "../middlewares/userActivity.middleware";
import { AuthenticatedUserRequest } from "../middlewares/auth";


export const createPayment = async(req:Request, res:Response, next:NextFunction) => {
    try {
        // this userID is only using for newActivity utill.
        const userID = (req as AuthenticatedUserRequest).user._id;

        if (!userID) return next(new ErrorHandler("userID not found", 404));

        const {amount, quantity, amountFormRecomm} = req.body;
        await newActivity(userID, req, res, next, `pay amount-(${amount}) amountFormRecomm-(${amountFormRecomm})`);

        if (!amount || !quantity) return (next(new ErrorHandler("Invalid amount or quantity", 400)))
        
        console.log((amount*100*quantity) + (amountFormRecomm*100));
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount:(amount*100*quantity) + (amountFormRecomm*100),
            currency:"inr"
        });

        next({statusCode:200, data:{success:true, message:paymentIntent.client_secret}});
        //res.status(200).json({success:true, message:paymentIntent.client_secret});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};