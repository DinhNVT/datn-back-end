import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CategoryPostSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: "",
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  posts: [
    {
      type: Schema.Types.ObjectId,
      ref: "Post",
    },
  ],
});

const CategoryPost = mongoose.model("CategoryPost", CategoryPostSchema);

export default CategoryPost;
