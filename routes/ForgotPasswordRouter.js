import express from "express";
import {
  changePasswordUser,
  checkTokenAndEmail,
} from "../controllers/ForgotPasswordController.js";

const ForgotPasswordRouter = express.Router();

ForgotPasswordRouter.get("/", checkTokenAndEmail);
ForgotPasswordRouter.put("/", changePasswordUser);

export default ForgotPasswordRouter;
