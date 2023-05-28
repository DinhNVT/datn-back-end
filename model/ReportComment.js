import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ReportCommentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    commentId: { type: String, required: true },
    typeComment: {
      type: String,
      enum: ["base", "sub"],
    },
    comment: { type: String, required: true },
    status: { type: String, enum: ["pending", "resolved"], default: "pending" },
  },
  {
    timestamps: true,
  }
);

const ReportComment = mongoose.model("ReportComment", ReportCommentSchema);

export default ReportComment;
