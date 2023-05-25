import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import authRole from "../middlewares/authRole.js";
import {
  createCategoryPost,
  getAllCategories,
  getAllCategoriesByAdmin,
  getAllCategoryDetail,
} from "../controllers/categoryPostController.js";

const CategoryPostRouter = express.Router();

CategoryPostRouter.post("/", authRole(["admin"]), createCategoryPost);
CategoryPostRouter.get("/", getAllCategories);
CategoryPostRouter.get("/:slug", getAllCategoryDetail);
CategoryPostRouter.get(
  "/by-admin",
  authRole(["admin"]),
  getAllCategoriesByAdmin
);

export default CategoryPostRouter;
