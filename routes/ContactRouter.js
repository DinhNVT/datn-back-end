import express from "express";
import {
  createContact,
  deleteMultipleContacts,
  getAllContacts,
  resolveMultipleContacts,
} from "../controllers/contactController.js";
import authRole from "../middlewares/authRole.js";

const ContactRouter = express.Router();

ContactRouter.post("/", createContact);
ContactRouter.get("/", authRole(["admin"]), getAllContacts);
ContactRouter.put("/resolve", authRole(["admin"]), resolveMultipleContacts);
ContactRouter.post(
  "/delete/multi",
  authRole(["admin"]),
  deleteMultipleContacts
);

export default ContactRouter;
