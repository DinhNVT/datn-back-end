import mongoose from "mongoose";
const { Schema } = mongoose;

const ContactSchema = new Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    content: { type: String, required: true },
    status: { type: String, enum: ["pending", "resolved"], default: "pending" },
  },
  {
    timestamps: true,
  }
);

const Contact = mongoose.model("Contact", ContactSchema);

export default Contact;
