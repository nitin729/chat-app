import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { fullName, userName, email, password, confirmPassword } = req.body;
    if (!(userName && email && password && confirmPassword)) {
      throw new ApiError(401, "email and password are required");
    }

    if (password !== confirmPassword) {
      throw new ApiError(400, "Passwords do not match");
    }

    const existingUser = await User.findOne({
      $or: [{ userName }, { email }],
    });

    if (existingUser) {
      throw new ApiError(409, "The user already exists");
    }

    let profilePictureLocalPath;
    if (req.file && req.file.path) {
      profilePictureLocalPath = req.file.path;
    }

    if (!profilePictureLocalPath) {
      throw new ApiError(400, "Local path not found");
    }

    const profilePictureUrl = await uploadOnCloudinary(profilePictureLocalPath);
    console.log(profilePictureUrl);
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
      "-password -confirmPassword -refreshToken"
    );

    if (!createdUser) {
      throw new ApiError(500, "Problem during fetching created user");
    }
    console.log(createdUser);
    return res
      .status(201)
      .json(new ApiResponse(200, createdUser, "User created successfully"));
  } catch (error) {
    console.log(error, "error");
  }
});

export { registerUser };
