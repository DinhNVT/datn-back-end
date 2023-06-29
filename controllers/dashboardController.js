import { StatusCodes } from "http-status-codes";
import Post from "../model/Post.js";
import moment from "moment";
import CategoryPost from "../model/CategoryPost.js";
import User from "../model/User.js";
import PostComment from "../model/PostComment.js";
import SubPostComment from "../model/SubPostComment.js";
import Role from "../model/Role.js";

// @desc    Get post count per day for the last 10 days
// @route   GET /api/v1/dashboard
// @access  private/Admin
export const getPostPerDay = async (req, res) => {
  try {
    // Lấy ngày hiện tại
    const currentDate = moment().endOf("day");

    // Tạo mảng chứa 10 ngày trước đó
    const dates = Array.from({ length: 10 }, (_, i) =>
      moment(currentDate).subtract(i, "days").startOf("day").toDate()
    );

    // Thực hiện aggregation để lấy số lượng bài viết trong mỗi ngày
    const result = await Post.aggregate([
      {
        $match: {
          createdAt: { $gte: dates[9] }, // Lọc bài viết từ ngày cách đây 10 ngày
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }, // Nhóm theo ngày (định dạng YYYY-MM-DD)
          },
          count: { $sum: 1 }, // Đếm số lượng bài viết
        },
      },
      {
        $sort: { _id: 1 }, // Sắp xếp theo ngày tăng dần
      },
    ]);

    // Đảo ngược kết quả để có thứ tự từ cũ đến mới
    const reversedResult = result.reverse();

    // Xử lý kết quả để có đủ 10 ngày (bao gồm cả những ngày không có bài viết)
    const formattedResult = dates.map((date) => {
      const formattedDate = moment(date).format("YYYY-MM-DD");
      const matchedItem = reversedResult.find(
        (item) => item._id === formattedDate
      );
      return {
        date: formattedDate,
        count: matchedItem ? matchedItem.count : 0,
      };
    });

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Dashboard data retrieved successfully",
      data: formattedResult,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Get user count per day for the last 10 days
// @route   GET /api/v1/dashboard
// @access  private/Admin
export const getUserCountPerDay = async (req, res) => {
  try {
    // Lấy ngày hiện tại
    const currentDate = moment().endOf("day");

    // Tạo mảng chứa 10 ngày trước đó
    const dates = Array.from({ length: 10 }, (_, i) =>
      moment(currentDate).subtract(i, "days").startOf("day").toDate()
    );

    // Thực hiện aggregation để lấy số lượng tài khoản trong mỗi ngày
    const result = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: dates[9] }, // Lọc tài khoản từ ngày cách đây 10 ngày
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }, // Nhóm theo ngày (định dạng YYYY-MM-DD)
          },
          count: { $sum: 1 }, // Đếm số lượng tài khoản
        },
      },
      {
        $sort: { _id: 1 }, // Sắp xếp theo ngày tăng dần
      },
    ]);

    // Đảo ngược kết quả để có thứ tự từ cũ đến mới
    const reversedResult = result.reverse();

    // Xử lý kết quả để có đủ 10 ngày (bao gồm cả những ngày không có tài khoản)
    const formattedResult = dates.map((date) => {
      const formattedDate = moment(date).format("YYYY-MM-DD");
      const matchedItem = reversedResult.find(
        (item) => item._id === formattedDate
      );
      return {
        date: formattedDate,
        count: matchedItem ? matchedItem.count : 0,
      };
    });

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Dashboard data retrieved successfully",
      data: formattedResult,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Get dashboard data (counts of posts, category posts, users, comments, subcomments)
// @route   GET /api/v1/dashboard
// @access  private/Admin
export const getCountDashboard = async (req, res) => {
  try {
    const postCount = await Post.countDocuments();
    const categoryPostCount = await CategoryPost.countDocuments();
    const userCount = await User.countDocuments();
    const commentCount = await PostComment.countDocuments();
    const subCommentCount = await SubPostComment.countDocuments();

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Dashboard data retrieved successfully",
      data: {
        postCount,
        categoryPostCount,
        userCount,
        commentCount,
        subCommentCount,
      },
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Get latest users
// @route   GET /api/v1/users/latest
// @access  private/Admin
export const getLatestUsers = async (req, res) => {
  const { limit } = req.query;
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .populate({
        path: "roleId",
        select: ["name"],
      })
      .limit(parseInt(limit))
      .select("-password");

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Latest users retrieved successfully",
      data: users,
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Get post count by status
// @route   GET /api/v1/posts/count
// @access  private/Admin
export const getPostCountByStatus = async (req, res) => {
  try {
    const draftCount = await Post.countDocuments({ status: "draft" });
    const publishedCount = await Post.countDocuments({ status: "published" });
    const blockedCount = await Post.countDocuments({ status: "blocked" });

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Post count retrieved successfully",
      data: {
        draft: draftCount,
        published: publishedCount,
        blocked: blockedCount,
      },
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Get user count by role name
// @route   GET /api/v1/users/count
// @access  private/Admin
export const getUserCountByRole = async (req, res) => {
  try {
    const userRole = await Role.findOne({ name: "user" });
    const adminRole = await Role.findOne({ name: "admin" });

    const userCount = await User.countDocuments({ roleId: userRole._id });
    const adminCount = await User.countDocuments({ roleId: adminRole._id });

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "User count retrieved successfully",
      data: {
        user: userCount,
        admin: adminCount,
      },
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Get user count by verification and blocked status
// @route   GET /api/v1/users/count
// @access  private/Admin
export const getUserCountStatus = async (req, res) => {
  try {
    // Đếm số lượng tài khoản đã verify nhưng không bị blocked
    const verifiedNotBlockedCount = await User.countDocuments({
      isVerify: true,
      isBlocked: false,
    });

    // Đếm số lượng tài khoản chưa verify nhưng không bị blocked
    const notVerifiedNotBlockedCount = await User.countDocuments({
      isVerify: false,
      isBlocked: false,
    });

    // Đếm số lượng tài khoản đã bị blocked
    const blockedCount = await User.countDocuments({ isBlocked: true });

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "User count retrieved successfully",
      data: {
        verifiedNotBlocked: verifiedNotBlockedCount,
        notVerifiedNotBlocked: notVerifiedNotBlockedCount,
        blocked: blockedCount,
      },
    });
  } catch (error) {
    console.log(error.message);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};
