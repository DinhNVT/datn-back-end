import { StatusCodes } from "http-status-codes";
import VerifyEmail from "../model/VerifyEmail.js";
import User from "../model/User.js";
import path from "path";

// @desc    Verify Email
// @route   POST /verify
// @access  Public
export const verifyTokenMail = async (req, res) => {
  const { email, token } = req.query;
  try {
    const verifyEmail = await VerifyEmail.findOne({ email }).sort({
      createdAt: "desc",
    });
    if (!verifyEmail) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .sendFile(path.join("public", "verifyFail.html"), { root: "." });
    }

    if (verifyEmail.token !== token) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .sendFile(path.join("public", "verifyFail.html"), { root: "." });
    }

    await User.findOneAndUpdate(
      { _id: verifyEmail.userId }, // find the user with the corresponding email
      { isVerify: true } // update that user's isVerify field to true
    );
    await VerifyEmail.deleteMany({ email: verifyEmail.email });
    res
      .status(StatusCodes.OK)
      .sendFile(path.join("public", "verifySuccess.html"), { root: "." });
  } catch (error) {
    console.log(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).send("Error");
  }
};
