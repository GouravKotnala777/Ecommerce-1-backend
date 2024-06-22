import { NextFunction, Request, Response } from "express";
import Cart from "../models/cartModel";
import { AuthenticatedUserRequest } from "../middlewares/auth";
import { ErrorHandler } from "../utils/utilities";
import mongoose from "mongoose";


export const addToCart = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productID, quantity}:{productID:string; quantity:number;} = req.body;
        
        console.log({productID, quantity});    

        if (!productID || !quantity) return next(new ErrorHandler("All fields are requried", 400));
        
        const isCartExist = await Cart.findOne({userID:(req as AuthenticatedUserRequest).user._id});

        if (isCartExist) {
            const isProductExistInCart = isCartExist.products.find((product) => product.productID.toString() === productID);
            
            console.log("************");
            console.log("Cart pahle se hai");
            console.log("************");
            

            if (!isProductExistInCart) {
                console.log("************");
                console.log("Product pahle nai tha");
                console.log("************");

                isCartExist.products.push({productID:new mongoose.Types.ObjectId(productID), quantity});
                await isCartExist.save();
            }
            else{
                console.log("************");
                console.log("Product pahle se tha");
                console.log("************");

                isCartExist.products = isCartExist.products.map((q) => {
                    if (q.productID.toString() === productID) {
                        return {productID:q.productID, quantity:q.quantity+quantity}
                    }
                    else{
                        return q;
                    }
                    
                });
                await isCartExist.save();
            }
        }
        else{
            console.log("************");
            console.log("Cart pahle nahi thi");
            console.log("************");

            const cart = await Cart.create({
                userID:(req as AuthenticatedUserRequest).user._id,
                products:{
                    productID,
                    quantity
                },
                totalPrice:696969
            });
    
            if (!cart) return next(new ErrorHandler("Internal Server Error", 500));
    
            // console.log({cart});
        }

        res.status(200).json({success:true, message:quantity > 1 ? `${quantity} Products added to cart` : `${quantity} Product added to cart`});        
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
