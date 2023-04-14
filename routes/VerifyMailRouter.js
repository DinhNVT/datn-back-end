import express from "express";
import { verifyTokenMail } from "../controllers/verifyMailController.js";

const VerifyEmailRouter = express.Router();

VerifyEmailRouter.get("/", verifyTokenMail);

export default VerifyEmailRouter;
