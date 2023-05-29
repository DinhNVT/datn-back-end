import { StatusCodes } from "http-status-codes";
import User from "../model/User.js";
import bcrypt from "bcryptjs";
import { isPasswordValid } from "../utils/validate.js";
import FavoritePost from "../model/FavoritePost.js";
import Post from "../model/Post.js";
import Follow from "../model/Follow.js";

// @desc    Get All Users
// @route   POST /api/v1/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .sort({ createdAt: -1 })
      .select("-password")
      .populate("roleId", "name");
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Get all users successfully",
      users,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: err.message });
  }
};

// @desc    Get User By Id
// @route   POST /api/v1/users/:id
// @access  Private/User
export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    if (id != req.userId) {
      return res
        .status(StatusCodes.FORBIDDEN)
        .json({ status: "fail", message: "You are not allowed" });
    }
    const user = await User.findById(id)
      .select("-password")
      .populate("roleId", "name");
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Get user successfully",
      user,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: err.message });
  }
};

// @desc    Change Password
// @route   POST /api/v1/users/change-password
// @access  Private/User
export const changePasswordUser = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.userId);
    const validPassword = await bcrypt.compare(oldPassword, user.password);

    if (!validPassword) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", message: "incorrect old password" });
    }

    if (!isPasswordValid(newPassword)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "fail", message: "Invalid new password" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedNewPassword;
    await user.save();

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Change password successfully",
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: err.message });
  }
};

// @desc    Get Public User By Id
// @route   POST /api/v1/users/:id
// @access  Public
export const getPublicUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findById(id).select(
      "_id username name email avatar bio gender"
    );
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "fail", message: "User does not exist" });
    }
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Get user successfully",
      user,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: err.message });
  }
};

// @desc    Get Public User By Id
// @route   POST /api/v1/users/public/
// @access  Public
export const getPublicUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username: username }).select(
      "_id username name email avatar bio gender"
    );
    if (!user) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "fail", message: "User does not exist" });
    }
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Get user successfully",
      user,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: err.message });
  }
};

// @desc    Add Post to Favorite
// @route   POST /api/v1/users/favorite
// @access  Private/user
export const addToFavorites = async (req, res) => {
  const { postId } = req.body;
  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", message: "Post not found" });
    }

    const favorite = await FavoritePost.findOne({
      userId: req.userId,
      postId: postId,
    });
    if (favorite) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "fail",
        message: "Post is already in favorites",
      });
    }

    const newFavorite = new FavoritePost({
      userId: req.userId,
      postId: postId,
    });

    await newFavorite.save();

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Post added to favorites",
      result: newFavorite,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Delete Favorite Post
// @route   DELETE /api/v1/users/favorite/:postId
// @access  Private/user
export const deleteFavoritePost = async (req, res) => {
  const { id } = req.params;
  try {
    const favorite = await FavoritePost.findOneAndRemove({
      userId: req.userId,
      postId: id,
    });

    if (!favorite) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", message: "Favorite post not found" });
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Favorite post deleted successfully",
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Get User's Favorite Posts
// @route   GET /api/v1/favorites
// @access  private/user
export const getUserFavorites = async (req, res) => {
  const { id } = req.params;
  try {
    if (id.toString() !== req.userId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ status: "fail", message: "Unauthorized" });
    }

    const favorites = await FavoritePost.find({ userId: req.userId });

    // Extract the postIds from the favorites
    const postIds = favorites.map((favorite) => favorite.postId);

    // Find the favorite posts
    const favoritePosts = await Post.find({
      _id: { $in: postIds },
      status: "published",
    }).populate({
      path: "tags",
      select: ["name"],
    });

    res.status(StatusCodes.OK).json({
      status: "success",
      posts: favoritePosts,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "fail",
      message: error.message,
    });
  }
};

// @desc    Follow a User
// @route   POST /api/v1/users/follow/:userId
// @access  private
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", message: "User not found" });
    }

    if (userId === req.userId) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "fail",
        message: "You cannot follow yourself",
      });
    }

    // Check if the user is already being followed
    const existingFollow = await Follow.findOne({
      follower: req.userId,
      following: userId,
    });

    if (existingFollow) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "fail",
        message: "You are already following this user",
      });
    }

    const newFollow = new Follow({
      follower: req.userId,
      following: userId,
    });

    await newFollow.save();

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Successfully followed the user",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "fail",
      message: error.message,
    });
  }
};

// @desc    Get follower list of a user
// @route   GET /api/v1/users/follower/:userId
// @access  public
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all Follow records where the specified user is being followed
    const followers = await Follow.find({ following: userId }).populate(
      "follower",
      "username name email avatar bio"
    );

    res.status(StatusCodes.OK).json({
      status: "success",
      data: followers,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "fail",
      message: error.message,
    });
  }
};

// @desc    Get following list of a user
// @route   GET /api/v1/users/following/:userId
// @access  public
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find all Follow records where the specified user is following others
    const following = await Follow.find({ follower: userId }).populate(
      "following",
      "username name email avatar bio"
    );

    res.status(StatusCodes.OK).json({
      status: "success",
      data: following,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "fail",
      message: error.message,
    });
  }
};

// @desc    Un Follow a user
// @route   DELETE /api/v1/users/follow/:userId
// @access  private
export const unFollowUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Find the Follow record by follower and following IDs
    const follow = await Follow.findOneAndRemove({
      follower: req.userId,
      following: userId,
    });

    if (!follow) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", message: "Follow record not found" });
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Un followed successfully",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "fail",
      message: error.message,
    });
  }
};
