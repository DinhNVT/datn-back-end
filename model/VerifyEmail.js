import mongoose from "mongoose";
const Schema = mongoose.Schema;

const VerifyEmailSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: { type: String, required: true },
    token: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const VerifyEmail = mongoose.model("VerifyEmail", VerifyEmailSchema);

export default VerifyEmail;
