import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import {
  loginUser,
  logout,
  registerUser,
} from "../controllers/user.controller.js";
import verifyjwt from "../middlewares/auth.middleware.js";

const userRouter = Router();

userRouter
  .route("/register-user")
  .post(upload.single("profilePicture"), registerUser);
userRouter.route("/login").post(loginUser);
userRouter.route("/logout").get(verifyjwt, logout);

export default userRouter;
