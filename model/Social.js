import mongoose from "mongoose";
const Schema = mongoose.Schema;

const SocialSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
  },
  {
    timestamps: true,
  }
);

const Social = mongoose.model("Social", SocialSchema);

export default Social;
