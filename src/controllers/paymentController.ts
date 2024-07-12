import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utilities";
import { stripe } from "../app";


export const createPayment = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {amount} = req.body;

        if (!amount) return (next(new ErrorHandler("Invalid amount", 400)))
        
        const paymentIntent = await stripe.paymentIntents.create({
            amount:amount*100,
            currency:"inr"
        });

        res.status(200).json({success:true, message:paymentIntent.client_secret});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};