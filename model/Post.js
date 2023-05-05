import mongoose from "mongoose";
const Schema = mongoose.Schema;

const PostSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CategoryPost",
      required: true,
      default: "",
    },
    title: { type: String, required: true, default: "" },
    slug: { type: String, required: true, unique: true, default: "" },
    content: { type: String, required: true, default: "" },
    status: {
      type: String,
      enum: ["draft", "published", "blocked"],
      default: "draft",
      required: true,
    },
    thumbnail_url: { type: String, default: "" },
    view_count: { type: Number, default: 0, required: true },
    like_count: { type: Number, default: 0, required: true },
    comment_count: { type: Number, default: 0, required: true },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
  },
  {
    timestamps: true,
  }
);

//compile the schema to model
const Post = mongoose.model("Post", PostSchema);

export default Post;
