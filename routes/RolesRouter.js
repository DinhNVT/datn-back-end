import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import authRole from "../middlewares/authRole.js";
import {
  createRolesController,
  getAllRoles,
} from "../controllers/rolesController.js";

const RolesRouter = express.Router();

RolesRouter.post("/", authRole(["admin"]), createRolesController);
RolesRouter.get("/", authRole(["admin"]), getAllRoles);

export default RolesRouter;
