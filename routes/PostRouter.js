import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import authRole from "../middlewares/authRole.js";
import {
  createPost,
  createPostComment,
  deletePost,
  getAllPosts,
  getPostComment,
  getPostDetail,
  getPostLatest,
  getPostsMe,
  getPostsOption,
  updatePost,
  uploadImagePost,
} from "../controllers/postControllser.js";
import uploadCloud from "../config/cloudinaryConfig.js";
import upload from "../config/multerConfig.js";

const PostRouter = express.Router();

PostRouter.post(
  "/",
  authRole(["user", "admin"]),
  uploadCloud.single("thumbnail"),
  createPost
);
PostRouter.put(
  "/:id",
  authRole(["user"]),
  uploadCloud.single("thumbnail"),
  updatePost
);
PostRouter.delete("/:id", authRole(["user", "admin"]), deletePost);
PostRouter.post("/image", isLoggedIn, upload.single("image"), uploadImagePost);
PostRouter.get("/latest", getPostLatest);
PostRouter.get("/get-all", getAllPosts);
PostRouter.get("/detail", getPostDetail);
PostRouter.post(
  "/comment",
  isLoggedIn,
  authRole(["user", "admin"]),
  createPostComment
);
PostRouter.get("/comment", getPostComment);
PostRouter.get("/option", getPostsOption);
PostRouter.get("/me", authRole(["user", "admin"]), getPostsMe);

export default PostRouter;
