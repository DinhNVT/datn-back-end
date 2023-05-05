import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import authRole from "../middlewares/authRole.js";
import { createPost, uploadImagePost } from "../controllers/postControllser.js";
import uploadCloud from "../config/cloudinaryConfig.js";
import upload from "../config/multerConfig.js";

const PostRouter = express.Router();

PostRouter.post(
  "/",
  authRole(["user", "admin"]),
  uploadCloud.single("thumbnail"),
  createPost
);

PostRouter.post("/image", isLoggedIn, upload.single("image"), uploadImagePost);

// UserRouter.get("/", authRole(["admin"]), getAllUsers);
// UserRouter.get("/:id", authRole(["user"]), getUserById);
// UserRouter.post("/change-password", authRole(["user"]), changePasswordUser);

export default PostRouter;
