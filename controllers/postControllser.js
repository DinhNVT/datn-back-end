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
import PostComment from "../model/PostComment.js";
import SubPostComment from "../model/SubPostComment.js";
import User from "../model/User.js";

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

// @desc    Delete Post
// @route   DELETE /api/v1/posts/:id
// @access  Private/User,Admin
export const deletePost = async (req, res) => {
  const postId = req.params.id;
  try {
    // Kiểm tra xem bài viết có tồn tại trong cơ sở dữ liệu không
    const post = await Post.findById(postId);
    if (!post) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", message: "Post not found" });
    }

    if (post.userId.toString() !== req.userId && req.role !== "admin") {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ status: "fail", message: "Unauthorized" });
    }

    // Xóa bài viết
    await post.remove();

    // Cập nhật bảng CategoryPost (nếu cần thiết)
    const category = await CategoryPost.findById(post.categoryId);
    if (category) {
      category.posts = category.posts.filter(
        (postId) => postId.toString() !== post._id.toString()
      );
      await category.save();
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Post deleted successfully",
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: err.message });
  }
};

// @desc    Update Post
// @route   PUT /api/v1/posts/:id
// @access  Private/User
export const updatePost = async (req, res) => {
  const { categoryId, title, content, status, tags } = req.body;
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", message: "Post not found" });
    }

    // Check if the logged in user is the owner of the post
    if (post.userId.toString() !== req.userId) {
      return res
        .status(StatusCodes.UNAUTHORIZED)
        .json({ status: "fail", message: "Unauthorized" });
    }

    const newTags = tags.split(",");

    if (status === "published") {
      const categoryPostExists = await CategoryPost.findOne({
        _id: categoryId,
      });
      if (!categoryPostExists) {
        if (req.file?.filename) {
          cloudinary.uploader.destroy(req.file?.filename);
        }
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ status: "fail", message: "Category post doesn't exist" });
      }

      if (!validator.isLength(title, { min: 2, max: 255 })) {
        if (req.file?.filename) {
          cloudinary.uploader.destroy(req.file?.filename);
        }
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: "fail",
          message: "length title is min:1 and max 255 only",
        });
      }

      if (!validator.isLength(content, { min: 10 })) {
        if (req.file?.filename) {
          cloudinary.uploader.destroy(req.file?.filename);
        }
        return res.status(StatusCodes.BAD_REQUEST).json({
          status: "fail",
          message: "length content is min:10",
        });
      }

      if (newTags.length < 1) {
        if (req.file?.filename) {
          cloudinary.uploader.destroy(req.file?.filename);
        }
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
        let existingTag = await Tag.findOne({ slug: TagSlug(tag) });

        if (!existingTag) {
          const slug = TagSlug(tag);
          existingTag = await Tag.create({ name: tag, slug: slug });
        }
        tagIds.push(existingTag._id);
      }
    }

    let thumbnailCheck = null;
    if (req.file) {
      if (post.thumbnail_url) {
        const splitThumbnail = post.thumbnail_url.split("/");
        cloudinary.uploader.destroy(
          `${splitThumbnail[splitThumbnail.length - 2]}/${
            splitThumbnail[splitThumbnail.length - 1].split(".")[0]
          }`
        );
      }
      thumbnailCheck = req.file.path;
    } else {
      thumbnailCheck = post.thumbnail_url;
    }

    post.categoryId = categoryId;
    post.title = title;
    post.slug = PostSlug(title);
    post.content = content;
    post.status = status;
    post.thumbnail_url = thumbnailCheck;
    post.tags = tagIds;

    const result = await post.save();

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Post updated successfully",
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

// @desc    Get Post Latest
// @route   GET /api/v1/posts/latest
// @access  Public
export const getPostLatest = async (req, res) => {
  try {
    const posts = await Post.find({
      status: "published",
    })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate({
        path: "userId",
        select: ["username", "avatar", "name"],
      })
      .populate({
        path: "tags",
        select: ["name"],
      })
      .select("-content -status");
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Get posts latest success",
      result: posts,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Get All Posts
// @route   GET /api/v1/posts/
// @access  Public
export const getAllPosts = async (req, res) => {
  try {
    let posts = Post.find({
      status: "published",
    })
      .populate({
        path: "userId",
        select: ["username", "avatar", "name"],
      })
      .populate({
        path: "tags",
        select: ["name"],
      });

    //pagination
    //page
    const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
    //limit
    const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
    //startIdx
    const startIndex = (page - 1) * limit;
    //endIdx
    const endIndex = page * limit;
    //total
    const total = await Post.countDocuments();

    posts = await posts.skip(startIndex).limit(limit);

    //pagination results
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }
    res.status(StatusCodes.OK).json({
      status: "success",
      total,
      results: posts.length,
      pagination,
      message: "Posts fetched successfully",
      posts,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Get Post Detail
// @route   GET /api/v1/posts/latest
// @access  Public
export const getPostDetail = async (req, res) => {
  const { slug } = req.query;
  try {
    const post = await Post.findOne({
      status: "published",
      slug: slug,
    })
      .populate({
        path: "userId",
        select: ["username", "avatar", "name", "bio", "gender", "social"],
      })
      .populate({
        path: "tags",
        select: ["name"],
      })
      .select("-status");
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Get post latest success",
      result: post,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Get All Posts
// @route   GET /api/v1/posts/
// @access  Public
export const getPostsOption = async (req, res) => {
  try {
    let posts = Post.find();

    let total = 0;
    if (req.query.userNewest) {
      posts = posts
        .find({ status: "published", userId: req.query.userNewest })
        .sort({ createdAt: -1 })
        .select("-content -categoryId -status -tags");
      total = await Post.countDocuments({
        status: "published",
        userId: req.query.userNewest,
      });
    } else if (req.query.userAllPost) {
      const userFind = await User.findOne({ username: req.query.userAllPost });
      posts = posts
        .find({ status: "published", userId: userFind._id })
        .select("-categoryId -status")
        .sort({ createdAt: -1 })
        .populate({
          path: "tags",
          select: ["name"],
        });
      total = await Post.countDocuments({
        status: "published",
        userId: userFind._id,
      });
    } else {
      posts = posts
        .find({ status: "published" })
        .select("-content -categoryId -status -tags");
      total = await Post.countDocuments();
    }

    //pagination
    //page
    const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
    //limit
    const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
    //startIdx
    const startIndex = (page - 1) * limit;
    //endIdx
    const endIndex = page * limit;

    posts = await posts.skip(startIndex).limit(limit);

    //pagination results
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      total,
      results: posts.length,
      pagination,
      message: "Posts option fetched successfully",
      posts,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Get Posts Me
// @route   GET /api/v1/posts/me
// @access  Private/user
export const getPostsMe = async (req, res) => {
  try {
    let posts = Post.find({ userId: req.userId });

    let total = 0;
    if (req.query.status === "published") {
      posts = posts
        .find({ status: req.query.status })
        .select("-categoryId -status")
        .sort({ createdAt: -1 })
        .populate({
          path: "tags",
          select: ["name"],
        });
      total = await Post.countDocuments({
        status: req.query.status,
        userId: req.userId,
      });
    } else if (req.query.status === "draft") {
      posts = posts
        .find({ status: req.query.status })
        .select("-categoryId -status")
        .sort({ createdAt: -1 })
        .populate({
          path: "tags",
          select: ["name"],
        });
      total = await Post.countDocuments({
        status: req.query.status,
        userId: req.userId,
      });
    } else if (req.query.status === "blocked") {
      posts = posts
        .find({ status: req.query.status })
        .select("-categoryId -status")
        .sort({ createdAt: -1 })
        .populate({
          path: "tags",
          select: ["name"],
        });
      total = await Post.countDocuments({
        status: req.query.status,
        userId: req.userId,
      });
    } else {
      posts = posts
        .find({ status: "published" })
        .select("-content -categoryId -status -tags");
      total = await Post.countDocuments();
    }

    //pagination
    //page
    const page = parseInt(req.query.page) ? parseInt(req.query.page) : 1;
    //limit
    const limit = parseInt(req.query.limit) ? parseInt(req.query.limit) : 10;
    //startIdx
    const startIndex = (page - 1) * limit;
    //endIdx
    const endIndex = page * limit;

    posts = await posts.skip(startIndex).limit(limit);

    //pagination results
    const pagination = {};
    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      total,
      results: posts.length,
      pagination,
      message: "Posts option fetched successfully",
      posts,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Create Post Comment
// @route   GET /api/v1/posts/comment
// @access  private
export const createPostComment = async (req, res) => {
  const { status } = req.query;
  try {
    if (status === "base") {
      const { postId, comment } = req.body;
      if (comment.length < 1) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ status: "fail", message: "Invalid comment" });
      }
      const postExist = await Post.findById(postId);
      if (!postExist) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ status: "fail", message: "Post does not exist" });
      }

      //Create comment
      const newPostComment = await new PostComment({
        userId: req.userId,
        postId: postId,
        comment: comment,
      });

      //Save to db
      const postComment = await newPostComment.save();
      res.status(StatusCodes.OK).json({
        status: "success",
        message: "Create post comment success",
        result: postComment,
      });
    } else if (status === "sub") {
      const { baseId, comment } = req.body;
      if (comment.length < 1) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ status: "fail", message: "Invalid comment" });
      }
      const postCommentExist = await PostComment.findById(baseId);
      if (!postCommentExist) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ status: "fail", message: "Post comment does not exist" });
      }

      //Create comment
      const newSubPostComment = await new SubPostComment({
        userId: req.userId,
        comment: comment,
      });

      //Save to db
      const subPostComment = await newSubPostComment.save();
      const postComment = await PostComment.findOne({ _id: baseId });

      if (postComment) {
        postComment.subComments.push(subPostComment._id);
        await postComment.save();
      }

      res.status(StatusCodes.OK).json({
        status: "success",
        message: "Create sub post comment success",
        result: subPostComment,
      });
    }
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};

// @desc    Get Post Detail
// @route   GET /api/v1/posts/latest
// @access  Public
export const getPostComment = async (req, res) => {
  const { postId } = req.query;
  try {
    const postComments = await PostComment.find({ postId: postId })
      .populate({
        path: "subComments",
        select: ["userId", "comment", "createdAt", "updatedAt"],
        populate: {
          path: "userId",
          select: ["name", "avatar"],
        },
      })
      .populate({
        path: "userId",
        select: ["username", "avatar", "name"],
      });

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Get post comments success",
      result: postComments,
    });
  } catch (error) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: error.message });
  }
};
