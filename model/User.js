import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    bio: { type: String, default: "" },
    careers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Career",
      },
    ],
    address: { type: String, default: "" },
    phone: { type: String, default: "" },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: "other",
    },
    birthday: { type: Date, default: new Date("01-01-1900") },
    roleId: {
      type: Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    isVerify: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

//compile the schema to model
const User = mongoose.model("User", UserSchema);

export default User;
