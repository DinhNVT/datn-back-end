import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import authRole from "../middlewares/authRole.js";
import { createRolesController } from "../controllers/rolesController.js";

const RolesRouter = express.Router();

RolesRouter.post("/", authRole(["master"]), createRolesController);

export default RolesRouter;
