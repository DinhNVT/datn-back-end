import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../model/User.js";
import Role from "../model/Role.js";
import { StatusCodes } from "http-status-codes";
import {
  isPasswordValid,
  isEmailValid,
  isFullNameValid,
  capitalizeFirstName,
} from "../utils/validate.js";
import { sendMail } from "../utils/mailer.js";
import fs from "fs";
import path from "path";
import VerifyEmail from "../model/VerifyEmail.js";
import ForgotPassword from "../model/ForgotPassword.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/generateToken.js";
import RefreshToken from "../model/RefreshToken.js";

// @desc    Register User
// @route   POST /api/v1/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    if (!isFullNameValid(name)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "fail", message: "Invalid name" });
    }

    if (!isEmailValid(email)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "fail", message: "Invalid email" });
    }

    //Check user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "fail", message: "User already exists" });
    }

    if (!isPasswordValid(password)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "fail", message: "Invalid password" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const role = await Role.findOne({ name: "user" });
    //Create user
    const newUser = await new User({
      name: capitalizeFirstName(name),
      email: email,
      password: hashedPassword,
      roleId: role._id,
    });

    //Save to db
    const user = await newUser.save();

    //send mail verify
    const hashedSenMail = await bcrypt.hash(user._doc.email, salt);
    // console.log(
    //   `${process.env.APP_URL}/verify?email=${user._doc.email}&token=${hashedSenMail}`
    // );
    const sendMailHtml = fs.readFileSync(
      path.join("public", "sendMail.html"),
      "utf-8"
    );
    const replaceSendMail = sendMailHtml.replace(
      "{%LINKVERIFY%}",
      `${process.env.APP_URL}/verify?email=${user._doc.email}&token=${hashedSenMail}`
    );
    sendMail(user._doc.email, process.env.MAIL_SUBJECT, replaceSendMail);
    //Create verify email
    const newVerifyEmail = await new VerifyEmail({
      userId: user._doc._id,
      email: user._doc.email,
      token: hashedSenMail,
    });
    //Save to db
    await newVerifyEmail.save();

    //Hidden password
    const { password: pwd, ...others } = user._doc;
    res.status(StatusCodes.CREATED).json({
      status: "success",
      message: "Create user successfully",
      ...others,
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error });
  }
};

// @desc    Forget password user
// @route   POST /api/v1/auth/forget-password
// @access  Public
export const forgetPasswordUser = async (req, res) => {
  const { email } = req.body;
  try {
    //Check user exists
    const userExists = await User.findOne({ email });
    if (!userExists) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ status: "fail", message: "Invalid email" });
    }

    //send mail verify
    const salt = await bcrypt.genSalt(10);
    const hashedSenMail = await bcrypt.hash(userExists.email, salt);
    const sendMailHtml = fs.readFileSync(
      path.join("public", "sendMailForgotPassword.html"),
      "utf-8"
    );
    const replaceSendMail = sendMailHtml.replace(
      "{%LINKCHANGEPASSWORD%}",
      `${process.env.APP_URL}/change-password?email=${userExists.email}&token=${hashedSenMail}`
    );
    sendMail(
      userExists.email,
      process.env.MAIL_SUBJECT_FORGOT_PASSWORD,
      replaceSendMail
    );

    await ForgotPassword.deleteMany({ email: userExists.email });

    //Create verify email
    const newForgotPassword = await new ForgotPassword({
      userId: userExists._id,
      email: userExists.email,
      token: hashedSenMail,
      expireAt: new Date(Date.now() + 1000 * 60 * 5),
    });
    //Save to db
    await newForgotPassword.save();

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Please! Check your email to change your password",
    });
  } catch (error) {
    console.log(error);
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error });
  }
};

// @desc    Login
// @route   POST /api/v1/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", message: "username does not exist" });
    } else if (!user.isVerify) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "fail",
        message: "Your account is not verified. Please check your email",
      });
    }

    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!validPassword) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", message: "incorrect password" });
    }

    if (user && user.isVerify && validPassword) {
      await RefreshToken.deleteMany({ userId: user._id });
      const role = await Role.findOne({ _id: user.roleId });
      const accessToken = generateAccessToken(user._id, role.name);
      const refreshToken = generateRefreshToken(user._id, role.name);
      const newRefreshToken = await new RefreshToken({
        token: refreshToken,
        userId: user._id,
      });

      //Save to db
      await newRefreshToken.save();
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      const { password, ...others } = user._doc;
      res
        .status(StatusCodes.OK)
        .json({ status: "success", ...others, role: role.name, accessToken });
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error });
  }
};

// @desc    Refresh token
// @route   POST /api/v1/auth/refresh-token
// @access  Public
export const refreshTokenUser = async (req, res) => {
  //take refresh token from user
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken)
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ status: "fail", message: "You are not authenticated" });
  const refreshTokenDB = await RefreshToken.findOne({ token: refreshToken });
  if (!refreshTokenDB) {
    return res
      .status(StatusCodes.FORBIDDEN)
      .json({ status: "fail", message: "Refresh token is not valid" });
  }
  jwt.verify(refreshToken, process.env.JWT_REFRESH_KEY, async (err, user) => {
    if (err) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", message: err });
    }
    try {
      await RefreshToken.deleteOne({ _id: refreshTokenDB._id });
      const newAccessToken = generateAccessToken(user.userId, user.userRole);
      const newRefreshToken = generateRefreshToken(user.userId, user.userRole);

      const newRefreshTokenDB = await new RefreshToken({
        token: newRefreshToken,
        userId: user.userId,
      });
      //Save to db
      await newRefreshTokenDB.save();

      res.cookie("refreshToken", newRefreshToken, {
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
      res
        .status(StatusCodes.OK)
        .json({ status: "success", accessToken: newAccessToken });
    } catch (error) {
      res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ status: "fail", message: error });
    }
  });
};

// @desc    Logout
// @route   POST /api/v1/auth/logout
// @access  Public
export const logoutUser = async (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  await RefreshToken.deleteOne({ token: refreshToken });
  res.clearCookie("refreshToken");
  res.status(StatusCodes.OK).json({ status: "success", message: "Logged out" });
};
