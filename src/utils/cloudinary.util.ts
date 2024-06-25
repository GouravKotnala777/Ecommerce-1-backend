import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


cloudinary.config({
  cloud_name:process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key:process.env.CLOUDINARY_API_KEY as string,
  api_secret:process.env.CLOUDINARY_API_SECRET as string
});

export const uploadOnCloudinary = async(localFilePath:string) => {
  try {

    if (!localFilePath) {
      console.log({localFilePath});
      return null
    }
    const res = await cloudinary.uploader.upload(localFilePath);

    console.log({res});
    

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