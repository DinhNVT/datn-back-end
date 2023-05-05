import express from "express";
import { isLoggedIn } from "../middlewares/isLoggedIn.js";
import authRole from "../middlewares/authRole.js";
import {
  createCategoryPost,
  getAllCategories,
} from "../controllers/categoryPostControllser.js";

const CategoryPostRouter = express.Router();

CategoryPostRouter.post("/", authRole(["admin"]), createCategoryPost);
CategoryPostRouter.get("/", getAllCategories);

export default CategoryPostRouter;
