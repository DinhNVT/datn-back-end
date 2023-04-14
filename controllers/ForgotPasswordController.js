import { StatusCodes } from "http-status-codes";
import User from "../model/User.js";
import path from "path";
import ForgotPassword from "../model/ForgotPassword.js";
import { isPasswordValid } from "../utils/validate.js";
import bcrypt from "bcryptjs";

// @desc    Check token and email forgot password
// @route   POST /verify
// @access  Public
export const checkTokenAndEmail = async (req, res) => {
  const { email, token } = req.query;
  try {
    const forgotPassword = await ForgotPassword.findOne({ email });
    if (!forgotPassword) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .sendFile(path.join("public", "forgotPasswordFail.html"), {
          root: ".",
        });
    }

    if (forgotPassword.token !== token) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .sendFile(path.join("public", "forgotPasswordFail.html"), {
          root: ".",
        });
    }

    const currentTime = new Date();
    const tokenExpireAt = new Date(forgotPassword.expireAt);
    if (currentTime.getTime() > tokenExpireAt.getTime()) {
      await ForgotPassword.deleteOne({ _id: forgotPassword._id });
      return res
        .status(StatusCodes.BAD_REQUEST)
        .sendFile(path.join("public", "forgotPasswordFail.html"), {
          root: ".",
        });
    }

    res
      .status(StatusCodes.OK)
      .sendFile(path.join("public", "formChangePassword.html"), { root: "." });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Error");
  }
};

// @desc    Change password user
// @route   POST /verify
// @access  Public
export const changePasswordUser = async (req, res) => {
  const { email, token, password } = req.body;
  try {
    const forgotPassword = await ForgotPassword.findOne({ email });
    if (!forgotPassword) {
      return res.status(StatusCodes.BAD_REQUEST).send("fail");
    }

    if (forgotPassword.token !== token) {
      return res.status(StatusCodes.BAD_REQUEST).send("fail");
    }

    const currentTime = new Date();
    const tokenExpireAt = new Date(forgotPassword.expireAt);
    if (currentTime.getTime() > tokenExpireAt.getTime()) {
      await ForgotPassword.deleteOne({ _id: forgotPassword._id });
      return res.status(StatusCodes.BAD_REQUEST).send("fail");
    }

    if (!isPasswordValid(password)) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Invalid password" });
    }

    //hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.findOneAndUpdate(
      { _id: forgotPassword.userId }, // find the user with the corresponding email
      { password: hashedPassword } // update that user's isVerify field to true
    );
    await ForgotPassword.deleteOne({ _id: forgotPassword._id });

    res.status(StatusCodes.OK).send("ok");
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Error");
  }
};
