import mongoose from "mongoose";
const { Schema } = mongoose;

const FollowSchema = new Schema(
  {
    follower: { type: Schema.Types.ObjectId, ref: "User", required: true },
    following: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  {
    timestamps: true,
  }
);

const Follow = mongoose.model("Follow", FollowSchema);

export default Follow;
