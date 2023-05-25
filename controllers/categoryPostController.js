import { StatusCodes } from "http-status-codes";
import CategoryPost from "../model/CategoryPost.js";
import { CategoryPostSlug } from "../utils/generateSlug.js";

// @desc    Create Category post
// @route   POST /api/v1/category-post
// @access  Private/Admin
export const createCategoryPost = async (req, res) => {
  const { name, description } = req.body;
  try {
    const newCategoryPost = new CategoryPost({
      name: name,
      description: description,
      slug: CategoryPostSlug(name),
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
