import { NextFunction, Request, Response } from "express";
import Cart from "../models/cartModel";
import { AuthenticatedUserRequest } from "../middlewares/auth";
import { ErrorHandler } from "../utils/utilities";
import mongoose from "mongoose";


export const addToCart = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productID, price, quantity}:{productID:string; price:number; quantity:number;} = req.body;
        
        if (!productID || !quantity || !price) return next(new ErrorHandler("All fields are requried", 400));
        
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
                isCartExist.totalPrice = isCartExist.totalPrice+(price*quantity);
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
                isCartExist.totalPrice = isCartExist.totalPrice+(price*quantity);

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
                totalPrice:(price*quantity)
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
export const removeFromCart = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productID, price, quantity}:{productID:string; price:number; quantity:number;} = req.body;

        const isCartExist = await Cart.findOne({userID:(req as AuthenticatedUserRequest).user._id});

        if (!isCartExist) return next(new ErrorHandler("Cart not exist", 404));
        
        const isProductExistInCart = isCartExist.products.find((product) => product.productID.toString() === productID);
        
        if (!isProductExistInCart) return next(new ErrorHandler("Product not exist in cart", 404));

        if (isProductExistInCart.quantity > quantity) {
            isCartExist.products = isCartExist.products.map((q) => {
                if (q.productID.toString() === productID) {
                    return {productID:q.productID, quantity:q.quantity-quantity}
                }
                else{
                    return q;
                }
            });
            isCartExist.totalPrice = isCartExist.totalPrice - (price*quantity);
            await isCartExist.save();
        }
        else if(isProductExistInCart.quantity === quantity) {
            const filteredProductsArray = isCartExist.products.filter((product) => product.productID.toString() !== productID);

            isCartExist.products = filteredProductsArray;
            isCartExist.totalPrice = isCartExist.totalPrice - (price*quantity);

            await isCartExist.save();
        }
        else{
            return next(new ErrorHandler(isProductExistInCart.quantity > 1 ? `You only have ${isProductExistInCart.quantity} products in cart` : `You only have ${isProductExistInCart.quantity} product in cart`, 400))
        }

        res.status(200).json({success:true, message:quantity > 1 ? `${quantity} Products removed from cart`:`${quantity} Product removed from cart`})        
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const allCarts = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const Carts = await Cart.find();

        if (Carts.length === 0) return (next(new ErrorHandler("No cart exits", 404)));
        
        res.status(200).json({success:true, message:Carts});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const myCart = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;

        if (!userID) return (next(new ErrorHandler("userID not found", 404)));
        
        const cart = await Cart.findOne({userID}).populate({model:"Product", path:"products.productID", select:"category name price rating description images"});

        if (!cart) return (next(new ErrorHandler("Cart is empty", 204)));
        
        res.status(200).json({success:true, message:cart});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const clearMyCart = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;

        if (!userID) return (next(new ErrorHandler("userID not found", 404)));
        
        const cart = await Cart.findOne({userID});

        if (!cart) return (next(new ErrorHandler("Cart not found", 404)));
        
        cart.products = [];
        cart.totalPrice = 0;

        await cart.save({});

        res.status(200).json({success:true, message:"Cart has been cleared"});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
