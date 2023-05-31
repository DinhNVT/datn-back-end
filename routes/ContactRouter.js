import express from "express";
import { createContact } from "../controllers/contactController.js";

const ContactRouter = express.Router();

ContactRouter.post("/", createContact);

export default ContactRouter;
