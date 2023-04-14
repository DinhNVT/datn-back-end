import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ForgotPasswordSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: { type: String, required: true },
    token: { type: String, required: true },
    expireAt: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

const ForgotPassword = mongoose.model("ForgotPassword", ForgotPasswordSchema);

export default ForgotPassword;
