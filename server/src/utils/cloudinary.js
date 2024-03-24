import { v2 as cloudinary } from "cloudinary";
import ApiError from "./apiError";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async () => {
  try {
    if (!localFilePath) throw new ApiError(503, "Local File Path not found");
    const response = cloudinary.uploader.upload(localFilePath, {
      folder: "chat-users",
      resource_type: auto,
    });
    if (!response) {
      throw new ApiError(502, "Did not recieve any response from cloudinary");
    }
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    throw new ApiError(500, "Error uploading on cloudinary", error);
  }
};

export default uploadOnCloudinary;
