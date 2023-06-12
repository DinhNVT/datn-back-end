import express from "express";
import {
  addToFavorites,
  addUser,
  blockAndUnblockUsers,
  blockUser,
  changePasswordUser,
  changeUserRole,
  changeUserRoles,
  deleteFavoritePost,
  followUser,
  getAllUsers,
  getFollowers,
  getFollowing,
  getFollowingIds,
  getPostIdUserFavorites,
  getPublicUserById,
  getPublicUserByUsername,
  getUserById,
  getUserByUserId,
  getUserFavorites,
  unFollowUser,
  unblockUser,
  updateAvatarUser,
  updateUserProfile,
} from "../controllers/userController.js";
import authRole from "../middlewares/authRole.js";
import upload from "../config/multerConfig.js";

const UserRouter = express.Router();

UserRouter.get("/", authRole(["admin"]), getAllUsers);
UserRouter.post("/", authRole(["admin"]), upload.single("avatar"), addUser);
UserRouter.get("/:id", authRole(["user", "admin"]), getUserById);
UserRouter.get("/user/id", authRole(["user", "admin"]), getUserByUserId);
UserRouter.put("/:id", authRole(["user", "admin"]), updateUserProfile);
UserRouter.put(
  "/avatar/:id",
  authRole(["user", "admin"]),
  upload.single("image"),
  updateAvatarUser
);
UserRouter.put(
  "/change-password/user",
  authRole(["user", "admin"]),
  changePasswordUser
);
UserRouter.get("/public/:id", getPublicUserById);
UserRouter.get("/public/username/:username", getPublicUserByUsername);

UserRouter.put("/block/:id", authRole(["admin"]), blockUser);
UserRouter.put("/unblock/:id", authRole(["admin"]), unblockUser);
UserRouter.put("/role-change/:id", authRole(["admin"]), changeUserRole);
UserRouter.put("/change-roles/users", authRole(["admin"]), changeUserRoles);
UserRouter.put(
  "/block-unblock/users",
  authRole(["admin"]),
  blockAndUnblockUsers
);

//Favorite router
UserRouter.post("/favorite", authRole(["user", "admin"]), addToFavorites);
UserRouter.get("/favorite/:id", authRole(["user", "admin"]), getUserFavorites);
UserRouter.get(
  "/favorite-post/id",
  authRole(["user", "admin"]),
  getPostIdUserFavorites
);
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
UserRouter.get("/following-ids/get", authRole(["user", "admin"]), getFollowingIds);
export default UserRouter;
