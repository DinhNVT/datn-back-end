import mongoose from "mongoose";
const Schema = mongoose.Schema;

const VideoYoutubeSchema = new Schema(
  {
    title: { type: String, required: true },
    videoId: { type: String, require: true },
  },
  {
    timestamps: true,
  }
);

const VideoYoutube = mongoose.model("VideoYoutube", VideoYoutubeSchema);

export default VideoYoutube;
