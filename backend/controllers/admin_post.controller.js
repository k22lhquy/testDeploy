import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";
// import DeletedPost from "../models/deletelog.model.js";

const deleteAllNotification = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const result = await Notification.deleteMany({ type: "report" });

    res.status(200).json({
      message: "All report notifications deleted successfully",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error in deleteAllNotification controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const notificationReport = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const notifications = await Notification.find({ type: { $in: ["report", "moderation"] } })
      .populate("from")
      .populate({
        path: "post",
        populate: { path: "user", model: "User" },
    }).sort({ createdAt: -1 });

    res.status(200).json({ message: "Notifications retrieved successfully", notifications });
  } catch (error) {
    console.error("Error in notificationReport controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getReportedPosts = async (req, res) => {
  try {
    const posts = await Post.find({ "reports.0": { $exists: true } })
      .sort({ updatedAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" })
      .populate({ path: "reports.user", select: "-password" });

    if (!posts || posts.length === 0)
      return res.status(404).json({ message: "No reported posts found" });

    res.status(200).json({ message: "Reported posts retrieved successfully", posts });
  } catch (error) {
    console.error("Error in getReportedPosts controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const deletePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const adminId = req.user.id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    // await DeletedPost.create({
    //   ...post.toObject(),
    //   originalPostId: post._id,
    //   deletedBy: adminId,
    // });

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted and backed up successfully" });
  } catch (error) {
    console.error("Error in deletePost controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const deletePostt = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post permanently deleted" });
  } catch (error) {
    console.error("Error in deletePost controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const post = await Post.findOne({ "comments._id": commentId });
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments = post.comments.filter(
      (comment) => comment._id.toString() !== commentId
    );
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error in deleteComment controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getDeletedPosts = async (req, res) => {
  try {
    // const posts = await DeletedPost.find()
    //   .populate("user", "username")
    //   .populate("deletedBy", "username")
    //   .sort({ deletedAt: -1 });

    res.status(200).json({ message: "Deleted posts fetched", posts });
  } catch (error) {
    console.error("Error fetching deleted posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    if (!text) return res.status(400).json({ message: "Please provide text to update" });

    const post = await Post.findOne({ "comments._id": commentId });
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comment = post.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    comment.text = text;
    await post.save();

    res.status(200).json({ message: "Comment updated successfully", post });
  } catch (error) {
    console.error("Error in editComment controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const togglePostVisibility = async (req, res) => {
  try {
    const { postId } = req.params;
    const adminId = req.user.id;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.isHidden = !post.isHidden;
    await post.save();

    res.status(200).json({
      message: post.isHidden ? "Post hidden from users" : "Post is now visible to users",
      Hidden: post.isHidden,
    });
  } catch (error) {
    console.error("Error in togglePostVisibility controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getHiddenPosts = async (req, res) => {
  try {
    const hiddenPosts = await Post.find({ isHidden: true })
      .sort({ updatedAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    res.status(200).json({ hiddenPosts });
  } catch (error) {
    console.error("Error in getHiddenPosts controller:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export {
  deletePost,
  deleteComment,
  getReportedPosts,
  getDeletedPosts,
  editComment,
  deletePostt,
  togglePostVisibility,
  getHiddenPosts,
  notificationReport,
  deleteAllNotification,
};
