import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getUserProfile,
  followUnfollowUser,
  updateUserProfile,
  getSuggestedUsers,
  getUser,
  changPassword,
} from "../controllers/user.controller.js";

const router = express.Router();

router.post("/profile/:username", protectRoute, getUserProfile);
router.get("/suggested", protectRoute, getSuggestedUsers);
router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUserProfile);
router.get("/profile/:id", getUser);
router.post("/changPassword", protectRoute, changPassword);

export default router;
