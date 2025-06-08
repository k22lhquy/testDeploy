import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  createPost,
  deletePost,
  commentOnPost,
  likeUnLikePost,
  getAllPost,
  getLikedPosts,
  getFollowingPosts,
  getUserPost,
  reportPost,
  editComment,
  editPost,
  reportComment,
  getPostById,
} from "../controllers/post.controller.js";

const router = express.Router();

router.get("/likes/:id", protectRoute, getLikedPosts);
router.get("/all", protectRoute, getAllPost);
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.post("/comment/:id", protectRoute, commentOnPost);
router.post("/like/:id", protectRoute, likeUnLikePost);
router.get("/following", protectRoute, getFollowingPosts);
router.get("/user/:username", protectRoute, getUserPost);
router.get("/:postId", protectRoute, getPostById);

router.post("/report/post/:postId", protectRoute, reportPost);
router.post("/report/comment/:commentId", protectRoute, reportComment);

router.put("/editComment/:commentId", protectRoute, editComment);
router.put("/editPost/:postId", protectRoute, editPost);

export default router;
