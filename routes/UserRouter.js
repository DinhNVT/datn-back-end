import express from "express";
import {
  changePasswordUser,
  getAllUsers,
  getPublicUserById,
  getUserById,
} from "../controllers/userController.js";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import authRole from "../middlewares/authRole.js";

const UserRouter = express.Router();

UserRouter.get("/", authRole(["admin"]), getAllUsers);
UserRouter.get("/:id", authRole(["user"]), getUserById);
UserRouter.post("/change-password", authRole(["user"]), changePasswordUser);
UserRouter.get("/public/:id", getPublicUserById);

export default UserRouter;
