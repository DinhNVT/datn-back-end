import mongoose from "mongoose";
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    username: { type: String, unique: true, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String, default: "" },
    bio: {
      type: String,
      enum: [
        "Nông dân",
        "Quản trị viên",
        "Chủ trang trại",
        "Nhà nghiên cứu",
        "Ẩn danh",
      ],
      default: "Ẩn danh",
    },
    careers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Career",
      },
    ],
    social: {
      facebook: {
        type: String,
        default: "",
      },
      youtube: {
        type: String,
        default: "",
      },
      instagram: {
        type: String,
        default: "",
      },
      tiktok: {
        type: String,
        default: "",
      },
    },
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
