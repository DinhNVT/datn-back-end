import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PostCommentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
    comment: { type: String, required: true },
    subComments: [{ type: Schema.Types.ObjectId, ref: "SubPostComment" }],
  },
  {
    timestamps: true,
  }
);

const PostComment = mongoose.model("PostComment", PostCommentSchema);

export default PostComment;
