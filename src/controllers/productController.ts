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

    sub_category:string; sub_category_type:string; item_form:string;
    total_servings:number; diet_type:string; flavour:string; age_range:number; about:string; ingredient:string;


    images:string;
    rating?:number;
    sku:string;
    discount?:number;
    brand:string;
    height?:number;
    width?:number;
    depth?:number;
    weight?:number;
    tags:string;
}

export const createProduct = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {name, description, price, category, stock, 
            sub_category, sub_category_type, item_form,
            images, rating, sku, discount, brand, height, width, depth, weight, tags}:CreateProductBodyTypes = req.body;


        console.log({name, description, price, category, stock, 
            sub_category, sub_category_type, item_form,
            images, rating, sku, discount, brand, height, width, depth, weight, tags});
        




        if (!name || !description || !price || !category || !stock || !sub_category || !brand) return next(new ErrorHandler("All fields are requried", 400));
        
        const photo:UploadApiResponse|null = await uploadOnCloudinary(req.file?.path as string, "Ecommerce1/products");

        if (!photo?.secure_url) return next(new ErrorHandler("secure_url not found", 404));

        const product = await Product.create({name, description, price, category, stock,
            sub_category, sub_category_type, item_form,
            images:photo?.secure_url, rating, sku, discount, brand, height, width, depth, weight, tags:tags.split(",").map((item) => item.trim())});

        if (!product) return next(new ErrorHandler("Internal Server Error", 500));            

        res.status(200).json({success:true, message:"Product created successfully"});        
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const allProducts = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {skip} = req.query;
        
        const totalProducts = await Product.countDocuments();
        const products = await Product.find().limit(5).skip(skip?Number(skip)*5:0);

        if (products.length === 0) return (next(new ErrorHandler("No product exits", 400)));
        
        res.status(200).json({success:true, message:products, totalProducts});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const singleProducts = async(req:Request, res:Response, next:NextFunction) => {
    try {
        console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
        
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


            total_servings, diet_type, flavour, age_range, about, ingredient,

        



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

        console.log({total_servings, diet_type, flavour, age_range, about, ingredient});
        

        if (!productID) return (next(new ErrorHandler("productID not found", 404)));
        
        const product = await Product.findByIdAndUpdate(productID, {
            ...(name&&{name}),
            ...(description&&{description}),
            ...(price&&{price}),
            ...(category&&{category}),
            ...(stock&&{stock}),


            ...(total_servings&&{total_servings}),
            ...(diet_type&&{diet_type}),
            ...(flavour&&{flavour}),
            ...(age_range&&{age_range}),
            ...(about&&{about:about.split(",").map((item) => item.trim())}),
            ...(ingredient&&{ingredient}),


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
export const findIncompleteProducts = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const incompleteProducts = await Product.find({
            $or:[
                {total_servings:0},
                {about:[]}
            ]
        });

        if (incompleteProducts.length === 0) return(next(new ErrorHandler("No product found", 404)));

        res.status(200).json({success:true, message:incompleteProducts});
    } catch (error) {
        console.log(error);
        next(error);
    }
};
export const findAllCategories = async(req:Request, res:Response, next:NextFunction) => {
    try {        
        const {groupedBy} = req.params;

        if (!groupedBy) return next(new ErrorHandler("groupedBy not found", 404));
        
        const allCategories = await Product.find().distinct(groupedBy);

        if (allCategories.length === 0) return next(new ErrorHandler("No categories found", 404));

        res.json({success:true, message:allCategories});
    } catch (error) {
        console.log(error);
        next(error);        
    }
};
export const getProductsOfSame = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {query, value} = req.params;
        
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
export const searchProductByQuery = async(req:Request<{searchQry:string;}, {}, {category?:string; sub_category?:string; brand?:string; price?:{minPrice:number; maxPrice:number;}}>, res:Response, next:NextFunction) => {
    try {
        const {skip} = req.query;
        const {searchQry} = req.params;
        const {category, sub_category, brand, price} = req.body;

        
        console.log({searchQry, skip:Number(skip), category, sub_category, brand});
        
        skip?
            console.log(`skip hai ${Number(skip)*5}`)
            :
            console.log(`skip nahi hai ${Number(skip)*5}`)

        category || sub_category || brand || price?.maxPrice ?
            console.log("Upper Wala")
            :
            console.log("Niche Wala")
            
        

        const products = await Product.find(

            category || sub_category || brand ?
            {
                ...(category&&{category:{$regex:category, $options:"i"}}),
                ...(sub_category&&{sub_category:{$regex:sub_category, $options:"i"}}),
                ...(brand&&{brand:{$regex:brand, $options:"i"}}),
                ...(price&&{price:{$gt:price.minPrice, $lt:price.maxPrice}})
            }
            :
            {
                $or:[
                    {name:{
                        $regex:searchQry,
                        $options:"i"
                    }},
                    {category:{
                        $regex:searchQry,
                        $options:"i"
                    }},
                    {brand:{
                        $regex:searchQry,
                        $options:"i"
                    }},
                    {tags:{$in:[searchQry]}}
                ],
                ...(price&&{price:{$gt:price.minPrice, $lt:price.maxPrice}})
            }
        ).limit(5).skip(skip?Number(skip)*5:0);

        if (!products) return next(new ErrorHandler("Searched Products not found", 404));


        const totalProducts = products.length;


        res.status(200).json({success:true, message:products, totalProducts});
    } catch (error) {
        console.log(error);
        next(error);
        
    }
};