import express from "express";
import {
  addToFavorites,
  changePasswordUser,
  deleteFavoritePost,
  followUser,
  getAllUsers,
  getFollowers,
  getFollowing,
  getPublicUserById,
  getPublicUserByUsername,
  getUserById,
  getUserFavorites,
  unFollowUser,
} from "../controllers/userController.js";
import authRole from "../middlewares/authRole.js";

const UserRouter = express.Router();

UserRouter.get("/", authRole(["admin"]), getAllUsers);
UserRouter.get("/:id", authRole(["user", "user"]), getUserById);
UserRouter.post(
  "/change-password",
  authRole(["user", "admin"]),
  changePasswordUser
);
UserRouter.get("/public/:id", getPublicUserById);
UserRouter.get("/public/username/:username", getPublicUserByUsername);

//Favorite router
UserRouter.post("/favorite", authRole(["user", "admin"]), addToFavorites);
UserRouter.get("/favorite/:id", authRole(["user", "admin"]), getUserFavorites);
UserRouter.delete(
  "/favorite/:id",
  authRole(["user", "admin"]),
  deleteFavoritePost
);

//Follow
UserRouter.post("/follow/:userId", authRole(["user", "admin"]), followUser);
UserRouter.delete("/follow/:userId", authRole(["user", "admin"]), unFollowUser);
UserRouter.get("/follower/:userId", getFollowers);
UserRouter.get("/following/:userId", getFollowing);
export default UserRouter;
