import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utilities";
import Review from "../models/reviewModel";
import { AuthenticatedUserRequest } from "../middlewares/auth";
import Product from "../models/productModel";


export const createReview = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {rating, comment}:{rating:number; comment:string;} = req.body;
        const userID = (req as AuthenticatedUserRequest).user._id;
        const {productID} = req.params;

        if (!rating || !comment) return next(new ErrorHandler("All fields are required", 400));
        if (!userID) return next(new ErrorHandler("userID not found", 404));
        if (!productID) return next(new ErrorHandler("productID not found", 404));
        
        const isReviewExist = await Review.findOne({userID, productID});
        const product = await Product.findById(productID);

        if (!product) return next(new ErrorHandler("Product not found", 404));

        if (isReviewExist) {
            product.rating = ((product.rating * product.reviews.length) + (rating - isReviewExist.rating)) / (product.reviews.length);

            isReviewExist.rating = rating;
            isReviewExist.comment = comment;

            await product.save();
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

            product.reviews.push(review._id);
            product.rating = ((product.rating * (product.reviews.length - 1)) + rating) / product.reviews.length;

            await product.save();

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

        const product = await Product.findById(productID);

        if (!product) return next(new ErrorHandler("Product not found", 404));

        product.rating = ((product.rating * product.reviews.length) - isReviewExist.rating) / (product.reviews.length - 1);
        product.reviews = product.reviews.filter((review) => review.toString() !== isReviewExist._id.toString());

        await product.save();

        res.status(200).json({success:true, message:"Review deleted successfully"});
    } catch (error) {
        console.log(error);
        next(error)
    }
};