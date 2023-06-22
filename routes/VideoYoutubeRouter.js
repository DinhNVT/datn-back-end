import express from "express";
import authRole from "../middlewares/authRole.js";
import {
  createVideoYouTube,
  deleteVideosYouTube,
  getAllVideoYoutube,
  getAllVideoYoutubeByAdmin,
  updateVideoYouTube,
} from "../controllers/videoYoutubeController.js";

const VideoYoutubeRouter = express.Router();

VideoYoutubeRouter.post("/", authRole(["admin"]), createVideoYouTube);
VideoYoutubeRouter.get("/", getAllVideoYoutube);
VideoYoutubeRouter.get(
  "/admin",
  authRole(["admin"]),
  getAllVideoYoutubeByAdmin
);
VideoYoutubeRouter.put("/:id", authRole(["admin"]), updateVideoYouTube);
VideoYoutubeRouter.post(
  "/delete-many",
  authRole(["admin"]),
  deleteVideosYouTube
);

export default VideoYoutubeRouter;
