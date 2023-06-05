import { StatusCodes } from "http-status-codes";
import CategoryPost from "../model/CategoryPost.js";
import Post from "../model/Post.js";
import { CategoryPostSlug } from "../utils/generateSlug.js";

// @desc    Create Category post
// @route   POST /api/v1/category-post
// @access  Private/Admin
export const createCategoryPost = async (req, res) => {
  const { name, description } = req.body;
  try {
    let slug = CategoryPostSlug(name);

    let isSlugUnique = false;
    while (!isSlugUnique) {
      const existingCategory = await CategoryPost.findOne({ slug });
      if (!existingCategory) {
        isSlugUnique = true;
      } else {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }
    }

    const newCategoryPost = new CategoryPost({
      name: name,
      description: description,
      slug: slug,
    });
    const result = await newCategoryPost.save();

    res.status(StatusCodes.OK);
    res.json({
      status: "success",
      message: "Category post created successfully",
      result,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: err.message });
  }
};

// @desc    Update Category post
// @route   PUT /api/v1/category-post/:id
// @access  Private/Admin
export const updateCategoryPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    let slug = CategoryPostSlug(name);
    let isSlugUnique = false;
    while (!isSlugUnique) {
      const existingCategory = await CategoryPost.findOne({
        slug,
        _id: { $ne: id },
      });
      if (!existingCategory) {
        isSlugUnique = true;
      } else {
        slug = `${slug}-${Math.floor(Math.random() * 1000)}`;
      }
    }

    const updatedCategory = await CategoryPost.findByIdAndUpdate(
      id,
      {
        name,
        description,
        slug,
      },
      { new: true }
    );

    if (!updatedCategory) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "fail",
        message: "Category post not found",
      });
    }

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Category post updated successfully",
      category: updatedCategory,
    });
  } catch (err) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "fail",
      message: err.message,
    });
  }
};

// @desc    Delete Category post
// @route   DELETE /api/v1/category-post/:id
// @access  Private/Admin
export const deleteCategoryPost = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await CategoryPost.findById(id);
    if (!category) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "fail",
        message: "Category not found",
      });
    }

    if (category.posts.length > 0) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        status: "fail",
        message: "Cannot delete category with existing posts",
      });
    }

    await CategoryPost.findByIdAndDelete(id);

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Category deleted successfully",
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "fail",
      message: error.message,
    });
  }
};

// @desc    Get All Category
// @route   POST /api/v1/category-post
// @access  Private/Admin
export const getAllCategories = async (req, res) => {
  const { name, description } = req.body;
  try {
    const categories = await CategoryPost.find();
    const otherCategory = categories.find(
      (category) => category.name === "Khác"
    );

    // Sắp xếp các category theo thứ tự chữ cái từ a-z
    const sortedCategories = categories.sort((a, b) =>
      a.name.localeCompare(b.name)
    );

    if (otherCategory) {
      const otherIndex = categories.indexOf(otherCategory);
      categories.splice(otherIndex, 1);
      categories.push(otherCategory);
    }

    res.json({
      status: "success",
      message: "Get all categories successfully",
      sortedCategories,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: err.message });
  }
};

// @desc    Get All Category By Admin
// @route   POST /api/v1/category-post/by-admin
// @access  Private/Admin
export const getAllCategoriesByAdmin = async (req, res) => {
  try {
    const categories = await CategoryPost.find().sort({ createdAt: -1 });
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Get all categories successfully",
      count: categories.length,
      categories,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: err.message });
  }
};

// @desc    Get Category Detail
// @route   POST /api/v1/category-post/:slug
// @access  Public
export const getAllCategoryDetail = async (req, res) => {
  const { slug } = req.params;
  try {
    if (!slug) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ status: "fail", message: "not found slug" });
    }
    const category = await CategoryPost.findOne({ slug: slug });
    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Get category successfully",
      category,
    });
  } catch (err) {
    res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ status: "fail", message: err.message });
  }
};

// @desc    Get Posts by Category
// @route   GET /api/v1/category-post/posts/:categoryId
// @access  Public
export const getPostsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    // Kiểm tra xem category có tồn tại không
    const categoryExists = await CategoryPost.findOne({ _id: categoryId });
    if (!categoryExists) {
      return res.status(StatusCodes.NOT_FOUND).json({
        status: "fail",
        message: "Category not found",
      });
    }

    // Lấy danh sách bài viết thuộc category
    const posts = await Post.find({ categoryId })
      .sort({ createdAt: -1 })
      .populate({
        path: "tags",
        select: ["name"],
      })
      .populate({
        path: "userId",
        select: ["username", "avatar", "name"],
      });

    res.status(StatusCodes.OK).json({
      status: "success",
      message: "Get posts successfully",
      posts: posts,
      category: categoryExists,
    });
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "fail",
      message: error.message,
    });
  }
};
