import Role from "../model/Role.js";
import { StatusCodes } from "http-status-codes";
import User from "../model/User.js";
import bcrypt from "bcryptjs";
import { isPasswordValid } from "../utils/validate.js";

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
      "name avatar bio gender social"
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
