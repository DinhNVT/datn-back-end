import { StatusCodes } from "http-status-codes";
import Post from "../model/Post.js";
import { PostSlug, TagSlug } from "../utils/generateSlug.js";
import Tag from "../model/Tag.js";
import CategoryPost from "../model/CategoryPost.js";
import { v2 as cloudinary } from "cloudinary";
import validator from "validator";
import {
  getStorage,
  ref,
  getDownloadURL,
  uploadBytesResumable,
} from "firebase/storage";
import { initializeApp } from "firebase/app";
import { firebaseConfig } from "../config/firebaseConfig.js";
import { giveCurrentDateTime } from "../utils/giveCurrentDateTime.js";

// @desc    Create Post
// @route   POST /api/v1/posts
// @access  Private/User,Admin
export const createPost = async (req, res) => {
  const { categoryId, title, content, status, tags } = req.body;
  try {
    const newTags = tags.split(",");
    // console.log(categoryId, title, content, status, tags);
    if (status === "published") {
      const categoryPostExists = await CategoryPost.findOne({
        _id: categoryId,
      });
      if (!categoryPostExists) {
        if (req.file?.filename) {
          cloudinary.uploader.destroy(req.file?.filename);
        }
        console.log("1");
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ status: "fail", message: "Category post doesn't exist" });
      }

      if (!validator.isLength(title, { min: 2, max: 255 })) {
        if (req.file?.filename) {
          cloudinary.uploader.destroy(req.file?.filename);
        }
        console.log("2");
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: "fail",
          message: "length title is min:1 and max 255 only",
        });
      }

      if (!validator.isLength(content, { min: 10 })) {
        if (req.file?.filename) {
          cloudinary.uploader.destroy(req.file?.filename);
        }
        console.log("3");
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: "fail",
          message: "length content is min:10",
        });
      }

      if (newTags.length < 1) {
        if (req.file?.filename) {
          cloudinary.uploader.destroy(req.file?.filename);
        }
        console.log("4");
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: "fail",
          message: "Must have at least 6 tags",
        });
      }
    }
    const tagIds = [];
    if (newTags.length >= 1) {
      for (let i = 0; i < newTags.length; i++) {
        const tag = newTags[i];
        // Check if the tag exists in the system

        let existingTag = await Tag.findOne({ slug: TagSlug(tag) });

        // If the tag doesn't exist, create a new one and save it to the system
        if (!existingTag) {
          const slug = TagSlug(tag);
          existingTag = await Tag.create({ name: tag, slug: slug });
        }
        // Add the tag's ID to the tagIds array
        tagIds.push(existingTag._id);
      }
    }

    const newPost = new Post({
      userId: req.userId,
      categoryId: categoryId,
      title: title,
      slug: PostSlug(title),
      content: content,
      status: status,
      thumbnail_url: req.file?.path,
      tags: tagIds,
    });
    const result = await newPost.save();

    const category = await CategoryPost.findOne({ _id: categoryId });
    category.posts.push(result._id);
    await category.save();

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Post created successfully",
      result,
    });
  } catch (err) {
    if (req.file?.filename) {
      cloudinary.uploader.destroy(req.file?.filename);
    }
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: err.message });
  }
};

// @desc    Upload Image Post
// @route   POST /api/v1/posts/image
// @access  Private/User
export const uploadImagePost = async (req, res) => {
  //Initialize a firebase application
  initializeApp(firebaseConfig);

  // Initialize Cloud Storage and get a reference to the service
  const storage = getStorage();
  try {
    const dateTime = giveCurrentDateTime();

    const storageRef = ref(
      storage,
      `posts-image/${req.file.originalname + "       " + dateTime}`
    );
    // Create file metadata including the content type
    const metadata = {
      contentType: req.file.mimetype,
    };
    // Upload the file in the bucket storage
    const snapshot = await uploadBytesResumable(
      storageRef,
      req.file.buffer,
      metadata
    );
    //by using uploadBytesResumable we can control the progress of uploading like pause, resume, cancel
    // Grab the public url
    const downloadURL = await getDownloadURL(snapshot.ref);
    res.status(StatusCodes.OK).json({
      status: "success",
      message: " file uploaded to firebase storage",
      url: downloadURL,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: err.message });
  }
};
