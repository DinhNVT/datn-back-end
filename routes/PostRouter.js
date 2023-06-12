import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import authRole from "../middlewares/authRole.js";
import {
  blockMultiplePosts,
  createPost,
  createPostComment,
  deleteMultiplePosts,
  deletePost,
  deletePostComment,
  getAllPosts,
  getAllPostsByAdmin,
  getAllTags,
  getFollowedPosts,
  getMostPopularTags,
  getMostViewedPosts,
  getPostComment,
  getPostDetail,
  getPostDetailById,
  getPostDetailByIdAdmin,
  getPostLatest,
  getPostsMe,
  getPostsOption,
  getRelatedPosts,
  unblockMultiplePosts,
  updatePost,
  updatePostComment,
  uploadImagePost,
} from "../controllers/postControllser.js";
import {
  createReportComment,
  getAllReportComments,
  resolveReportComment,
  resolveMultipleReportComments,
  deleteMultipleReportComments,
} from "../controllers/reportCommentController.js";
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
  authRole(["user", "admin"]),
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

//report comment
PostRouter.post("/comment/report", createReportComment);
PostRouter.get("/comment/report", authRole(["admin"]), getAllReportComments);
PostRouter.put(
  "/comment/report/:reportId/resolve",
  authRole(["admin"]),
  resolveReportComment
);
PostRouter.put(
  "/comment/report/resolve/multiple",
  authRole(["admin"]),
  resolveMultipleReportComments
);
PostRouter.put(
  "/comment/report/delete/multiple",
  authRole(["admin"]),
  deleteMultipleReportComments
);

PostRouter.get("/comment", getPostComment);
PostRouter.get("/option", getPostsOption);
PostRouter.get("/me", authRole(["user", "admin"]), getPostsMe);
PostRouter.get("/tags", authRole(["user", "admin"]), getAllTags);

PostRouter.get("/admin/get-all", authRole(["admin"]), getAllPostsByAdmin);
PostRouter.put("/admin/block", authRole(["admin"]), blockMultiplePosts);
PostRouter.put("/admin/unblock", authRole(["admin"]), unblockMultiplePosts);
PostRouter.post(
  "/admin/delete-many-posts",
  authRole(["admin"]),
  deleteMultiplePosts
);
PostRouter.get(
  "/admin/detail/:id",
  authRole(["admin"]),
  getPostDetailByIdAdmin
);

PostRouter.get("/followed", authRole(["admin", "user"]), getFollowedPosts);
PostRouter.get("/most-view", getMostViewedPosts);
PostRouter.get("/most-tags", getMostPopularTags);
PostRouter.get("/relate-posts", getRelatedPosts);

export default PostRouter;
