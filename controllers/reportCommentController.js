import { StatusCodes } from "http-status-codes";
import PostComment from "../model/PostComment.js";
import SubPostComment from "../model/SubPostComment.js";
import ReportComment from "../model/ReportComment.js";
import Post from "../model/Post.js";

// @desc    Create Report Comment
// @route   POST /api/v1/posts/comment/report
// @access  Public
export const createReportComment = async (req, res) => {
  const { commentId, typeComment } = req.body;

  try {
    let commentFind;
    let postId;
    if (typeComment === "base") {
      const reportComment = await ReportComment.findOne({
        typeComment: "base",
        commentId: commentId,
      });
      if (!!reportComment) {
        return res.status(StatusCodes.OK).json({
          status: "success",
          message: "Report comment created successfully",
        });
      }
      commentFind = await PostComment.findById(commentId);
      if (!commentFind) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: "fail", message: "Comment not found" });
      } else {
        postId = commentFind.postId;
      }
    } else if (typeComment === "sub") {
      const reportComment = await ReportComment.findOne({
        typeComment: "sub",
        commentId: commentId,
      });
      if (!!reportComment) {
        return res.status(StatusCodes.OK).json({
          status: "success",
          message: "Report comment created successfully",
        });
      }
      commentFind = await SubPostComment.findById(commentId).populate({
        path: "postCommentId",
        select: ["postId"],
      });
      if (!commentFind) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: "fail", message: "Comment not found" });
      } else {
        postId = commentFind.postCommentId.postId;
      }
    } else {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", message: "Type comment not found" });
    }

    // Create the report comment
    const newReportComment = new ReportComment({
      userId: commentFind.userId,
      postId: postId,
      commentId: commentId,
      typeComment: typeComment,
      comment: commentFind.comment,
    });

    // Save the report comment to the database
    const reportComment = await newReportComment.save();

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Report comment created successfully",
      result: reportComment,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Resolve Report Comment
// @route   PUT /api/v1/posts/comment/report/:reportId/resolve
// @access  private/Admin
export const resolveReportComment = async (req, res) => {
  const { reportId } = req.params;

  try {
    // Find the report comment by ID
    const reportComment = await ReportComment.findById(reportId);
    if (!reportComment) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", message: "Report comment not found" });
    } else if (reportComment.status === "resolved") {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "fail", message: "Report comment resolved" });
    }

    if (reportComment.typeComment === "base") {
      // Find the post comment by ID
      const postComment = await PostComment.findById(reportComment.commentId);
      if (!postComment) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: "fail", message: "Post comment not found" });
      }

      await Post.findOneAndUpdate(
        { _id: postComment.postId },
        { $inc: { comment_count: -(1 + postComment.subComments.length) } },
        { new: true }
      );

      // Delete sub comments if exist
      if (postComment.subComments.length > 0) {
        await SubPostComment.deleteMany({
          _id: { $in: postComment.subComments },
        });
      }

      // Delete the comment
      await PostComment.deleteOne({ _id: reportComment.commentId });
    } else if (reportComment.typeComment === "sub") {
      // Find the sub comment by ID
      const subComment = await SubPostComment.findById(reportComment.commentId);
      if (!subComment) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: "fail", message: "Sub comment not found" });
      }

      // Find the base comment and remove the sub comment's ID
      const postComment = await PostComment.findByIdAndUpdate(
        subComment.postCommentId,
        { $pull: { subComments: reportComment.commentId } },
        { new: true }
      );

      if (!postComment) {
        return res
          .status(StatusCodes.NOT_FOUND)
          .json({ status: "fail", message: "Base comment not found" });
      }

      await Post.findOneAndUpdate(
        { _id: postComment.postId },
        { $inc: { comment_count: -1 } },
        { new: true }
      );

      // Delete the sub comment
      await SubPostComment.deleteOne({ _id: reportComment.commentId });
    } else {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "fail",
        message: "Not found status",
      });
    }

    // Update the status of the report comment to "resolved"
    const updatedReportComment = await ReportComment.findOneAndUpdate(
      { _id: reportId },
      { status: "resolved" },
      { new: true }
    );

    if (!updatedReportComment) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", message: "Report comment not found" });
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Report comment resolved successfully",
      result: updatedReportComment,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Resolve Multiple Report Comments
// @route   PUT /api/v1/posts/comment/report/resolve-multiple
// @access  private/Admin
export const resolveMultipleReportComments = async (req, res) => {
  const { reportIds } = req.body;

  try {
    // Find the report comments by IDs
    const reportComments = await ReportComment.find({
      _id: { $in: reportIds },
    });

    // Filter out already resolved report comments
    const unresolvedReportComments = reportComments.filter(
      (report) => report.status !== "resolved"
    );

    if (unresolvedReportComments.length === 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "fail",
        message: "All selected report comments are already resolved",
      });
    }

    const resolvedCommentIds = [];
    const deletedPostCommentIds = [];
    const deletedSubCommentIds = [];

    // Process each report comment
    for (const reportComment of unresolvedReportComments) {
      if (reportComment.typeComment === "base") {
        // Find the post comment by ID
        const postComment = await PostComment.findById(reportComment.commentId);

        if (postComment) {
          // Delete sub comments if exist
          await Post.findOneAndUpdate(
            { _id: postComment.postId },
            { $inc: { comment_count: -(1 + postComment.subComments.length) } },
            { new: true }
          );
          if (postComment.subComments.length > 0) {
            await SubPostComment.deleteMany({
              _id: { $in: postComment.subComments },
            });
            deletedSubCommentIds.push(...postComment.subComments);
          }

          // Delete the post comment
          await PostComment.deleteOne({ _id: reportComment.commentId });
          deletedPostCommentIds.push(reportComment.commentId);
        }
      } else if (reportComment.typeComment === "sub") {
        // Find the sub comment by ID
        const subComment = await SubPostComment.findById(
          reportComment.commentId
        );

        if (subComment) {
          // Find the base comment and remove the sub comment's ID
          const postComment = await PostComment.findByIdAndUpdate(
            subComment.postCommentId,
            { $pull: { subComments: reportComment.commentId } },
            { new: true }
          );

          if (postComment) {
            await Post.findOneAndUpdate(
              { _id: postComment.postId },
              { $inc: { comment_count: -1 } },
              { new: true }
            );
            // Delete the sub comment
            await SubPostComment.deleteOne({ _id: reportComment.commentId });
            deletedSubCommentIds.push(reportComment.commentId);
          }
        }
      }

      // Update the status of the report comment to "resolved"
      await ReportComment.findOneAndUpdate(
        { _id: reportComment._id },
        { status: "resolved" }
      );

      resolvedCommentIds.push(reportComment._id);
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Report comments resolved successfully",
      resolvedCommentIds,
      deletedPostCommentIds,
      deletedSubCommentIds,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Delete Multiple Report Comments
// @route   DELETE /api/v1/posts/comment/report/delete-multiple
// @access  private/Admin
export const deleteMultipleReportComments = async (req, res) => {
  const { reportIds } = req.body;

  try {
    // Delete the report comments
    const deleteResults = await ReportComment.deleteMany({
      _id: { $in: reportIds },
    });

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Report comments deleted successfully",
      deleteResults,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Get all Report Comments
// @route   GET /api/v1/posts/comment/report
// @access  private/Admin
export const getAllReportComments = async (req, res) => {
  try {
    const reportComments = await ReportComment.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "userId",
        select: ["username", "avatar", "name"],
      })
      .populate({
        path: "postId",
        select: ["title", "slug", "thumbnail_url"],
      });
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "All report comments retrieved successfully",
      reportComments,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};
