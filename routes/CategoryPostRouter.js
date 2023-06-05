import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import authRole from "../middlewares/authRole.js";
import {
  createCategoryPost,
  deleteCategoryPost,
  getAllCategories,
  getAllCategoriesByAdmin,
  getAllCategoryDetail,
  getPostsByCategory,
  updateCategoryPost,
} from "../controllers/categoryPostController.js";

const CategoryPostRouter = express.Router();

CategoryPostRouter.post("/", authRole(["admin"]), createCategoryPost);
CategoryPostRouter.put("/:id", authRole(["admin"]), updateCategoryPost);
CategoryPostRouter.delete("/:id", authRole(["admin"]), deleteCategoryPost);
CategoryPostRouter.get(
  "/posts/:categoryId",
  authRole(["admin"]),
  getPostsByCategory
);
CategoryPostRouter.get("/", getAllCategories);
CategoryPostRouter.get("/:slug", getAllCategoryDetail);
CategoryPostRouter.get(
  "/get/by-admin",
  authRole(["admin"]),
  getAllCategoriesByAdmin
);

export default CategoryPostRouter;
