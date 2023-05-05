import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "posts",
    resource_type: "auto",
    allowedFormats: ["jpeg", "png", "jpg"],
    transformation: [{ width: 800, crop: "fill" }],
  },
});

const uploadCloud = multer({ storage });

export default uploadCloud;
