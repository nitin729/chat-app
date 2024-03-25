import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { registerUser } from "../controllers/user.controller.js";

const userRouter = Router();

userRouter
  .route("/register-user")
  .post(upload.single("profilePicture"), registerUser);

export default userRouter;
