import express from "express";
import { checkAdmin, protectRoute } from "../middleware/protectRoute.js";

import {
  signupAdmin,
  loginAdmin,
  blockUser,
  getAllUsers,
  updateUserProfile,
  logout,
  updateRoleAdmin,
} from "../controllers/admin_user.controller.js";

import {
  deletePost,
  deleteComment,
  getReportedPosts,
  getDeletedPosts,
  editComment,
  togglePostVisibility,
  deletePostt,
  getHiddenPosts,
  notificationReport,
  deleteAllNotification,
} from "../controllers/admin_post.controller.js";

import {
  getUserActivities,
  getAnalytics,
  getUserEvents,
  getAdminReports,
} from "../controllers/admin_system.controller.js";

const router = express.Router();

router.post("/signup", signupAdmin);
router.post("/login", loginAdmin);
router.post("/logout", logout);

router.put("/block/:userId", protectRoute, checkAdmin, blockUser);
router.get("/all", protectRoute, checkAdmin, getAllUsers);
router.put("/update/:userId", protectRoute, checkAdmin, updateUserProfile);

router.get("/activities/:userId", protectRoute, checkAdmin, getUserActivities);
router.get("/analytics", protectRoute, checkAdmin, getAnalytics);
router.get("/events/:userId", protectRoute, checkAdmin, getUserEvents);

router.delete("/posts/:postId", protectRoute, checkAdmin, deletePost);
router.delete("/comments/:commentId", protectRoute, checkAdmin, deleteComment);
router.put("/editComment/:commentId", protectRoute, checkAdmin, editComment);
router.get("/hideUnHidePost/:postId", protectRoute, checkAdmin, togglePostVisibility);
router.delete("/deletePost/:postId", protectRoute, checkAdmin, deletePostt);
router.get("/hiddenPosts", protectRoute, checkAdmin, getHiddenPosts);
router.get("/updateRole/:userId", protectRoute, checkAdmin, updateRoleAdmin);

router.get("/reportedTotal", protectRoute, checkAdmin, getAdminReports);
router.get("/reportedPosts", protectRoute, checkAdmin, getReportedPosts);
router.get("/deletedposts", protectRoute, checkAdmin, getDeletedPosts);
router.get("/getAllNotification", protectRoute, checkAdmin, notificationReport);
router.delete("/deleteAllNotification", protectRoute, checkAdmin, deleteAllNotification);

export default router;
