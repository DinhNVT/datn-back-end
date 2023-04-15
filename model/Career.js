import mongoose from "mongoose";
const Schema = mongoose.Schema;

const CareerSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Career = mongoose.model("Career", CareerSchema);

export default Career;
