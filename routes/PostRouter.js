import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import authRole from "../middlewares/authRole.js";
import {
  createPost,
  createPostComment,
  createReportComment,
  deletePost,
  deletePostComment,
  getAllPosts,
  getAllTags,
  getPostComment,
  getPostDetail,
  getPostDetailById,
  getPostLatest,
  getPostsMe,
  getPostsOption,
  resolveReportComment,
  updatePost,
  updatePostComment,
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
PostRouter.get("/detail/:id", authRole(["user", "admin"]), getPostDetailById);
PostRouter.post("/comment", authRole(["user", "admin"]), createPostComment);
PostRouter.put("/comment/:id", authRole(["user", "admin"]), updatePostComment);
PostRouter.delete(
  "/comment/:id",
  authRole(["user", "admin"]),
  deletePostComment
);
PostRouter.post("/comment/report", createReportComment);
PostRouter.put(
  "/comment/report/:reportId/resolve",
  authRole(["admin"]),
  resolveReportComment
);
PostRouter.get("/comment", getPostComment);
PostRouter.get("/option", getPostsOption);
PostRouter.get("/me", authRole(["user", "admin"]), getPostsMe);
PostRouter.get("/tags", authRole(["user", "admin"]), getAllTags);

export default PostRouter;
