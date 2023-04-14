import express from "express";
import {
  forgetPasswordUser,
  loginUser,
  logoutUser,
  refreshTokenUser,
  registerUser,
} from "../controllers/authController.js";

const AuthRouter = express.Router();

AuthRouter.post("/register", registerUser);
AuthRouter.post("/forget-password", forgetPasswordUser);
AuthRouter.post("/login", loginUser);
AuthRouter.post("/refresh-token", refreshTokenUser);
AuthRouter.post("/logout", logoutUser);

export default AuthRouter;
