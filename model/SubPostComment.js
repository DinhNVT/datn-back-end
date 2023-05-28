import mongoose from "mongoose";
const Schema = mongoose.Schema;

const SubPostCommentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postCommentId: {
      type: Schema.Types.ObjectId,
      ref: "PostComment",
      required: true,
    },
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const SubPostComment = mongoose.model("SubPostComment", SubPostCommentSchema);

export default SubPostComment;
