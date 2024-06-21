import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utilities";
import Product from "../models/productModel";

interface CreateProductBodyTypes {
    name:string;
    description:string;
    price:number;
    category:string;
    stock:number;
    images:string;
    rating?:number;
    sku:string;
    discount?:number;
    brand:string;
    height?:number;
    width?:number;
    depth?:number;
    weight?:number;
    tags:string[];
}

export const createProduct = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {
            name,
            description,
            price,
            category,
            stock,
            images,
            rating,
            sku,
            discount,
            brand,
            height,
            width,
            depth,
            weight,
            tags
        }:CreateProductBodyTypes = req.body;
        
        console.log({name, description, price, category, stock, images, rating, sku, discount, brand, height, width, depth, weight, tags});    

        if (!name || !description || !price || !category || !stock || !sku || !brand) return next(new ErrorHandler("All fields are requried", 400));
        
        const product = await Product.create({name,
            description,
            price,
            category,
            stock,
            images,
            rating,
            sku,
            discount,
            brand,
            height,
            width,
            depth,
            weight,
            tags});

        if (!product) return next(new ErrorHandler("Internal Server Error", 500));

        console.log({product});

        res.status(200).json({success:true, message:"Product created successfully"});        
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const allProducts = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const products = await Product.find();

        if (products.length === 0) return (next(new ErrorHandler("No product exits", 400)));
        
        res.status(200).json({success:true, message:products});
    } catch (error) {
        console.log(error);
        next(error);
    }
};