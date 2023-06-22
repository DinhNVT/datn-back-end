import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dbConnect from "../database/connectDB.js";
import RolesRouter from "../routes/RolesRouter.js";
import AuthRouter from "../routes/AuthRouter.js";
import VerifyEmailRouter from "../routes/VerifyMailRouter.js";
import ForgotPasswordRouter from "../routes/ForgotPasswordRouter.js";
import UserRouter from "../routes/UserRouter.js";
import PostRouter from "../routes/PostRouter.js";
import CategoryPostRouter from "../routes/CategoryPostRouter.js";
import ContactRouter from "../routes/ContactRouter.js";
import DashboardRouter from "../routes/DashboardRouter.js";
import VideoYoutubeRouter from "../routes/VideoYoutubeRouter.js";
dotenv.config();
//db connect
dbConnect();
const app = express();
app.use(cookieParser());
const corsOptions = {
  origin: process.env.END_POINT_ALL.split(","),
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());
//server static files
app.use(express.static("public"));

app.use("/api/v1/roles/", RolesRouter);
app.use("/api/v1/auth/", AuthRouter);
app.use("/verify", VerifyEmailRouter);
app.use("/change-password", ForgotPasswordRouter);
app.use("/api/v1/users/", UserRouter);
app.use("/api/v1/posts/", PostRouter);
app.use("/api/v1/category-post/", CategoryPostRouter);
app.use("/api/v1/contact/", ContactRouter);
app.use("/api/v1/dashboard/", DashboardRouter);
app.use("/api/v1/video-youtube/", VideoYoutubeRouter);

export default app;
