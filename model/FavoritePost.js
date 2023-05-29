import mongoose from "mongoose";

const { Schema } = mongoose;

const FavoritePostSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    postId: { type: Schema.Types.ObjectId, ref: "Post", required: true },
  },
  {
    timestamps: true,
  }
);

const FavoritePost = mongoose.model("FavoritePost", FavoritePostSchema);

export default FavoritePost;
