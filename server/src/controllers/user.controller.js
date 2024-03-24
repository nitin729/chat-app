import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, userName, email, password, confirmPassword } = req.body;
  if (!(userName && email && password && confirmPassword)) {
    throw new ApiError(401, "email and password are required");
  }

  if (password !== confirmPassword) {
    console.log("in Password");
    throw new ApiError(401, "Passwords do not match");
  }
  console.log("in Password");
  const existingUser = await User.findOne({ email });
  console.log("existingUser");

  if (existingUser) {
    throw new ApiError(401, "This user already exists");
  }

  let profilePictureLocalPath;
  if (
    req.files &&
    req.files.profilePicture &&
    Array.isArray(req.files.profilePicture) &&
    req.files.profilePicture.length > 0
  ) {
    profilePictureLocalPath = req.files?.profilePicture[0].path;
  }

  if (!profilePictureLocalPath) {
    throw new ApiError(400, "Local path not found");
  }

  const profilePictureUrl = await uploadOnCloudinary(profilePictureLocalPath);
  if (!profilePictureUrl) {
    throw new ApiError(500, "Problem while uploading on cloudinary");
  }

  const user = await User.create({
    userName: userName.toLowerCase() || "",
    fullName,
    email,
    password,
    profilePicture: profilePictureUrl.url || "",
  });

  if (!user) {
    throw new ApiError(500, "Problem during user creation");
  }

  const createdUser = await User.findById(user._id).select(
    "-password",
    "-refreshToken"
  );

  if (!createdUser) {
    throw new ApiError(500, "Problem during fetching created user");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

export { registerUser };
