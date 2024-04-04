import asyncHandler from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import uploadOnCloudinary from "../utils/cloudinary.js";

const cookieOptions = {
  httpOnly: true,
  secure: true,
};

const generateTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();

    user.refreshToken = refreshToken;

    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    console.log(error, "Problem while generating tokens");
  }
};

const registerUser = asyncHandler(async (req, res) => {
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
    "-password -refreshToken"
  );
  if (!createdUser) {
    throw new ApiError(500, "Internal server error");
  }
  return res
    .status(201)
    .json(
      new ApiResponse(200, createdUser, "User has been registered successfully")
    );
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email && !password) {
    throw new ApiError(402, "Please enter email and password");
  }
  //Check if User is present
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new ApiError(
      402,
      "User not found. Please create a User before loging in"
    );
  }
  //Check Password
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Password is incorrect");
  }

  const { accessToken, refreshToken } = await generateTokens(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  if (!loggedInUser) {
    throw new ApiError(500, "Internal Server Error");
  }

  return res
    .status(200)
    .cookie("accessToken", accessToken, cookieOptions)
    .cookie("refreshToken", refreshToken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged in succesfully"
      )
    );
});

const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user?.id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out succesfully"));
});
export { registerUser, loginUser, logout };
