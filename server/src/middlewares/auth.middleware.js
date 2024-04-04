import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/apiError.js";
import { User } from "../models/user.model.js";

const verifyjwt = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }
  console.log(token, "token");

  const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  if (!decodedToken) {
    throw new ApiError(401, "Unauthorized access");
  }
  console.log(decodedToken);
  const user = await User.findById(decodedToken?.id).select(
    "-password -refreshToken"
  );
  console.log(user, "user");
  if (!user) throw new ApiError(501, "User not found");

  req.user = user;
  next();
  /* catch (error) {
    throw new ApiError(401, "Invalid access token", error);
  } */
});

export default verifyjwt;
