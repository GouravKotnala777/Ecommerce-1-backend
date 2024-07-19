import { NextFunction, Request, Response } from "express";
import { ErrorHandler } from "../utils/utilities";
import Product from "../models/productModel";
import { uploadOnCloudinary } from "../utils/cloudinary.util";
import { UploadApiResponse } from "cloudinary";

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
        const {name, description, price, category, stock, images, rating, sku, discount, brand, height, width, depth, weight, tags}:CreateProductBodyTypes = req.body;

        if (!name || !description || !price || !category || !stock || !brand) return next(new ErrorHandler("All fields are requried", 400));
        
        const photo:UploadApiResponse|null = await uploadOnCloudinary(req.file?.path as string, "Ecommerce1/products");

        if (!photo?.secure_url) return next(new ErrorHandler("secure_url not found", 404));

        const product = await Product.create({name, description, price, category, stock, images:photo?.secure_url, rating, sku, discount, brand, height, width, depth, weight, tags});

        if (!product) return next(new ErrorHandler("Internal Server Error", 500));            

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
export const singleProducts = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productID} = req.params;

        if (!productID) return (next(new ErrorHandler("productID not found", 404)));
        
        const product = await Product.findById(productID).populate({model:"Review", path:"reviews", select:"_id userID rating comment createdAt updatedAt", populate:({model:"User", path:"userID", select:"name email"})});

        if (!product) return (next(new ErrorHandler("Product not found", 404)));
        
        res.status(200).json({success:true, message:product});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const deleteProduct = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productID} = req.params;

        if (!productID) return (next(new ErrorHandler("productID not found", 404)));
        
        const product = await Product.findByIdAndDelete(productID);

        if (!product) return (next(new ErrorHandler("Product not found", 404)));
        
        res.status(200).json({success:true, message:"Product deleted successfully"});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const updateProduct = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {productID} = req.params;
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

        if (!productID) return (next(new ErrorHandler("productID not found", 404)));
        
        const product = await Product.findByIdAndUpdate(productID, {
            ...(name&&{name}),
            ...(description&&{description}),
            ...(price&&{price}),
            ...(category&&{category}),
            ...(stock&&{stock}),
            ...(images&&{images}),
            ...(rating&&{rating}),
            ...(sku&&{sku}),
            ...(discount&&{discount}),
            ...(brand&&{brand}),
            ...(height&&{height}),
            ...(width&&{width}),
            ...(depth&&{depth}),
            ...(weight&&{weight}),
            ...(tags?.length !== 0 &&{tags})
        });

        if (!product) return (next(new ErrorHandler("Product not found", 404)));
        
        res.status(200).json({success:true, message:"Product updated successfully"});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const findOutStockProducts = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const fewLeft = await Product.find({stock:{$lt:4}}).sort({stock:"asc"});

        if (fewLeft.length === 0) return(next(new ErrorHandler("No product found", 404)));

        res.status(200).json({success:true, message:fewLeft})        
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const getProductsOfSame = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {query, value} = req.params;

        console.log({paramsQuery:query});
        console.log(value);
        
        const products = await Product.find({
            [query]:query === "rating"?
                        Number(value)
                        :
                        {
                            $regex:value,
                            $options:"i"
                        }
        });

        if (products.length === 0) return next(new ErrorHandler("Products not found", 404));

        res.status(200).json({success:true, message:products});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};