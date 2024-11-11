import { NextFunction, Request, Response } from "express";
import { uploadOnCloudinary } from "../utils/cloudinary.util";
import { ErrorHandler } from "../utils/utilities";
import MiscModel from "../models/miscModel";

// Hero-Slider
export const insertNewSliderImage = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {linkURL} = req.body;
        const imagePath = req.file?.path;

        if (!imagePath) return next(new ErrorHandler("File path not found", 404));

        const cloudinaryRes = await uploadOnCloudinary(imagePath, "misc/hero_slider");

        if (!cloudinaryRes) return next(new ErrorHandler("Image not stored on cloudinary", 404));

        const misc = await MiscModel.find();
        
        if (misc[0] === undefined) {
            const cr = await MiscModel.create({
                heroSlider:[{
                    imageURL:cloudinaryRes.secure_url,
                    linkURL
                }]
            });
        }
        else{
            if (misc[0].heroSlider.length === 5) return next(new ErrorHandler("Image slots are full", 400));

            misc[0].heroSlider.push({
                imageURL:cloudinaryRes.secure_url,
                linkURL
            })
    
            await misc[0].save();
        }

        res.status(200).json({success:true, message:cloudinaryRes});
    } catch (error) {
        next(error);
    }
};
export const getHeroSlider = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const misc = await MiscModel.find();
        
        if (misc[0] === undefined) return next(new ErrorHandler("misc[0] not found", 404));

        const heroSlider = misc[0].heroSlider;

        res.status(200).json({success:true, message:heroSlider});
    } catch (error) {
        next(error);
    }
};
export const updateHeroSliderImage = async(req:Request, res:Response, next:NextFunction) => {
    try {
        const {position, linkURL}:{position:0|1|2|3|4; linkURL?:string;} = req.body;
        const imagePath = req.file?.path;
        const misc = await MiscModel.find();
        
        if (misc[0] === undefined) return next(new ErrorHandler("misc[0] not found", 404));

        if (linkURL) misc[0].heroSlider[Number(position)].linkURL = linkURL;
        if (imagePath) {
            const cloudinaryRes = await uploadOnCloudinary(imagePath, "misc/hero_slider");

            if (!cloudinaryRes) return next(new ErrorHandler("Image not stored on cloudinary", 404));

            misc[0].heroSlider[Number(position)].imageURL = cloudinaryRes.secure_url;
        }

        await misc[0].save();

        res.status(200).json({success:true, message:misc[0].heroSlider});
    } catch (error) {
        next(error);
    }
};