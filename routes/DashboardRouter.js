import express from "express";
import {
  getCountDashboard,
  getLatestUsers,
  getPostCountByStatus,
  getPostPerDay,
  getUserCountByRole,
} from "../controllers/dashboardController.js";
import authRole from "../middlewares/authRole.js";

const DashboardRouter = express.Router();

DashboardRouter.get("/post-per-day", 
// authRole(["admin"]),
 getPostPerDay);
DashboardRouter.get("/count-dashboard", authRole(["admin"]), getCountDashboard);
DashboardRouter.get("/latest-user", authRole(["admin"]), getLatestUsers);
DashboardRouter.get(
  "/post-count/by-status",
  authRole(["admin"]),
  getPostCountByStatus
);
DashboardRouter.get(
  "/user-count/by-role",
  authRole(["admin"]),
  getUserCountByRole
);

export default DashboardRouter;
