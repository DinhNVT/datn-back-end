import dotenv from "dotenv";
import express from "express";
import cookieParser from "cookie-parser";
import dbConnect from "../database/connectDB.js";
import RolesRouter from "../routes/RolesRouter.js";
import AuthRouter from "../routes/AuthRouter.js";
import VerifyEmailRouter from "../routes/VerifyMailRouter.js";
import ForgotPasswordRouter from "../routes/ForgotPasswordRouter.js";
import UserRouter from "../routes/UserRouter.js";
dotenv.config();
//db connect
dbConnect();
const app = express();
app.use(cookieParser());
app.use(express.json());
//server static files
app.use(express.static("public"));

app.use("/api/v1/roles/", RolesRouter);
app.use("/api/v1/auth/", AuthRouter);
app.use("/verify", VerifyEmailRouter);
app.use("/change-password", ForgotPasswordRouter);
app.use("/api/v1/users/", UserRouter);

export default app;
