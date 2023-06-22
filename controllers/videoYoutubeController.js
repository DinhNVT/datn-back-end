import { StatusCodes } from "http-status-codes";
import VideoYoutube from "../model/VideoYoutube.js";

// @desc    Create Video YouTube
// @route   POST /api/v1/video-youtube
// @access  Private/Admin
export const createVideoYouTube = async (req, res) => {
  const { title, videoId } = req.body;
  try {
    const newVideoYouTube = new VideoYoutube({
      title,
      videoId,
    });
    const result = await newVideoYouTube.save();

    res.status(StatusCodes.OK);
    res.json({
      status: "success",
      message: "Video YouTube created successfully",
      video: result,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: err.message });
  }
};

// @desc    Delete multiple Video YouTube
// @route   DELETE /api/v1/video-youtube
// @access  Private/Admin
export const deleteVideosYouTube = async (req, res) => {
  try {
    const { videoIds } = req.body;

    const deletedVideos = await VideoYoutube.deleteMany({
      _id: { $in: videoIds },
    });

    if (deletedVideos.deletedCount === 0) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "fail",
        message: "No videos found for deletion",
      });
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Videos deleted successfully",
      deletedVideosCount: deletedVideos.deletedCount,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "fail",
      message: error.message,
    });
  }
};

// @desc    Update Video YouTube
// @route   PUT /api/v1/video-youtube/:id
// @access  Private/Admin
export const updateVideoYouTube = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, videoId } = req.body;

    const updatedVideo = await VideoYoutube.findByIdAndUpdate(
      id,
      {
        title,
        videoId,
      },
      { new: true }
    );

    if (!updatedVideo) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "fail",
        message: "Video YouTube not found",
      });
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Video YouTube updated successfully",
      video: updatedVideo,
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "fail",
      message: err.message,
    });
  }
};

// @desc    Get all video youtube
// @route   GET /api/v1/video-youtube
// @access  Public
export const getAllVideoYoutube = async (req, res) => {
  try {
    let videos = VideoYoutube.find().sort({ createdAt: -1 });

    let total = 0;
    if (!!req.query?.keyword) {
      const keyword = req.query.keyword;
      videos = videos.find({ title: { $regex: keyword, $options: "i" } });

      total = await VideoYoutube.countDocuments({
        title: { $regex: keyword, $options: "i" },
      });
    } else {
      total = await VideoYoutube.countDocuments();
    }

    //pagination
    //page
    const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
    //limit
    const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
    //startIdx
    const startIndex = (page - 1) * limit;
    //endIdx
    const endIndex = page * limit;

    videos = await videos.skip(startIndex).limit(limit);

    //pagination results
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "All video youtube retrieved successfully",
      total,
      results: videos.length,
      pagination,
      videos,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "fail",
      message: error.message,
    });
  }
};
// @desc    Get all video youtube
// @route   GET /api/v1/video-youtube/admin
// @access  Private/Admin
export const getAllVideoYoutubeByAdmin = async (req, res) => {
  try {
    const videos = await VideoYoutube.find().sort({ createdAt: -1 });

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "All video youtube retrieved successfully",
      videos,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "fail",
      message: error.message,
    });
  }
};
