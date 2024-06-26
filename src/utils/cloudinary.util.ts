import {v2 as cloudinary} from "cloudinary";
import fs from "fs";

  
export const uploadOnCloudinary = async(localFilePath:string, cloudinaryDestinationFoler:string) => {
  try {

    if (!localFilePath) {
      return null
    }
    const res = await cloudinary.uploader.upload(localFilePath, {
      folder:cloudinaryDestinationFoler
    });

    if (res.url) {
      console.log("File is uploaded successfully");
      fs.unlinkSync(localFilePath);
    }

    return res;
  } catch (error) {
    console.log(error);
    return null;    
  }
}