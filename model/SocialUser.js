import mongoose from "mongoose";
const Schema = mongoose.Schema;

const SocialUserSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    socialId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    url: {
      type: Schema.Types.ObjectId,
      ref: "Role",
    },
  },
  {
    timestamps: true,
  }
);

const SocialUser = mongoose.model("SocialUser", SocialUserSchema);

export default SocialUser;
