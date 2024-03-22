//initialize express router and all sort of initialization
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

export const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(cookieParser());

app.use(express.json({ limit: "16kB", extended: true }));

app.use(express.static("public"));

//Routes
import userRouter from "routes/user.route.js";

//route declaration
app.use("/api/v1/users", userRouter);
