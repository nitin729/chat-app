import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
      unique: true,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    confirmPassword: {
      type: String,
      required: [true, "Password is required"],
    },

    profilePicture: {
      type: String,
    },
    groups: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Group",
      },
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

//Encrypting the password before saving in database

userSchema.pre("save", async (next) => {
  if (this.isModified("password")) {
    this.password = bcrypt.hash(this.password, 10);
    next();
  }
});

userSchema.methods.isPasswordCorrect = async (password) => {
  return await bcrypt.compare(this.password, password);
};

userSchema.methods.generateAccessToken = () => {
  return jwt.sign(
    //payload
    {
      id: _id,
    },
    //access token
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = () => {
  return jwt.sign(
    //payload
    {
      id: _id,
    },
    //Refresh token
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
