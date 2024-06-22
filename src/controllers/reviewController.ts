import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utilities";
import Review from "../models/reviewModel";
import { AuthenticatedUserRequest } from "../middlewares/auth";
import Product from "../models/productModel";


export const createReview = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {rating, comment} = req.body;
        const userID = (req as AuthenticatedUserRequest).user._id;
        const {productID} = req.params;

        console.log({rating, comment, userID, productID});
        

        if (!rating || !comment) return next(new ErrorHandler("All fields are required", 400));
        if (!userID) return next(new ErrorHandler("userID not found", 404));
        if (!productID) return next(new ErrorHandler("productID not found", 404));
        
        const isReviewExist = await Review.findOne({userID, productID});

        if (isReviewExist) {
            isReviewExist.rating = rating;
            isReviewExist.comment = comment;

            await isReviewExist.save();

            return res.status(200).json({success:true, message:"Review updated successfully"});
        }
        else{
            const review = await Review.create({
                userID,
                productID,
                rating,
                comment
            });
            
            if (!review) return next(new ErrorHandler("Internal Server Error", 500));

            await Product.findByIdAndUpdate(productID, {
                $push:{reviews:review._id}
            });
            
            return res.status(200).json({success:true, message:"Review created successfully"});
        }



    } catch (error) {
        console.log(error);
        next(error)
    }
};
export const removeReview = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const userID = (req as AuthenticatedUserRequest).user._id;
        const {productID} = req.params;

        if (!userID) return next(new ErrorHandler("userID not found", 404));
        if (!productID) return next(new ErrorHandler("productID not found", 404));
        
        const isReviewExist = await Review.findOneAndDelete({userID, productID});
        
        if (!isReviewExist) return next(new ErrorHandler("Review not found", 404));

        await Product.findByIdAndUpdate(productID, {
            $pull:{reviews:isReviewExist._id}
        })

        res.status(200).json({success:true, message:"Review deleted successfully"});
    } catch (error) {
        console.log(error);
        next(error)
    }
};