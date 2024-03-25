import { v2 as cloudinary } from "cloudinary";
import ApiError from "./apiError.js";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    //upload file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder: "chat-users",
      resource_type: "auto",
    });
    // file has been uploaded successfully
    // console.log("response for file upload", response);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    // remove the locally saved temp file as the upload failed
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export default uploadOnCloudinary;
