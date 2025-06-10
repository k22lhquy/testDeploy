import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";
import { moderatePostContent } from "../moderation/moderation.service.js";
// import {
//   moderatePostContent,
//   moderateCommentContent,
//   checkImageForInappropriateContent,
//   notifyAdmins
// } from '../moderation/moderation.service.js';

const getPostById = async (req, res) => {
  try {
    const { postId } = req.params;
    const post = await Post.findById(postId).populate(
      "user",
      "username profileImg fullname"
    );

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post); // trả trực tiếp object thay vì { post }
  } catch (error) {
    console.error("❌ Error fetching post:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const createPost = async (req, res) => {
  try {
    const { text } = req.body;
    let { image } = req.body;
    const { userId } = req.user;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ message: "You are blocked. You cannot post." });
    }

    if (!text && !image) {
      return res.status(400).json({ message: "Please provide text or image" });
    }

    if (image) {
      const uploadedResponse = await cloudinary.uploader.upload(image);
      image = uploadedResponse.secure_url;
    }

    const newPost = await Post.create({
      user: userId,
      text,
      image,
    });

    await newPost.save();

    await moderatePostContent(newPost);

    res.status(201).json({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.user.toString() !== req.user.userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this post" });
    }
    if (post.image) {
      const publicId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }
    await Post.findByIdAndDelete(id);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const commentOnPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const { userId } = req.user;

    if (!text) {
      return res.status(400).json({ message: "Please provide text" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.isBlocked) {
      return res
        .status(403)
        .json({ message: "You are blocked. You cannot comment." });
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = {
      user,
      text,
    };

    // const isFlagged = await moderateCommentContent(comment, post._id);

    post.comments.push(comment);
    await post.save();

    res.status(200).json({
      // message: isFlagged
      //   ? "Comment added, but flagged for moderation"
      //   : "Comment added successfully",
      post,
      comment,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const likeUnLikePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.user;
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (post.likes.includes(userId.toString())) {
      post.likes = post.likes.filter(
        (like) => like.toString() !== userId.toString()
      );
      await post.save();
      await User.updateOne({ _id: userId }, { $pull: { likedPosts: id } });

      return res.status(200).json({
        message: "Post unliked successfully",
        post,
      });
    } else {
      post.likes.push(userId);
      const notification = new Notification({
        from: userId,
        to: post.user,
        type: "like",
        post: id,
      });
      await notification.save();
      await post.save();
      await User.updateOne({ _id: userId }, { $push: { likedPosts: id } });
      return res.status(200).json({
        message: "Post liked successfully",
        post,
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllPost = async (req, res) => {
  try {
    const posts = await Post.find({ isHidden: false })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    if (posts.length === 0) {
      return res.status(200).json({ message: "No posts found", posts: [] });
    }

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Error in getAllPost:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getLikedPosts = async (req, res) => {
  const { userId } = req.user;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    res.status(200).json({ posts: likedPosts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getFollowingPosts = async (req, res) => {
  try {
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const followingUsers = user.following;
    const posts = await Post.find({ user: { $in: followingUsers } })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });

    res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserPost = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const posts = await Post.find({ user: user._id })
      .sort({ createdAt: -1 })
      .populate({ path: "user", select: "-password" })
      .populate({ path: "comments.user", select: "-password" });
    res.status(200).json({ posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const reportPost = async (req, res) => {
  try {
    const { reason } = req.body;
    const { userId } = req.user;

    const postId = req.params.postId.trim();

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isAlreadyReported = post.reports.some(
      (report) => report.user.toString() === userId
    );
    if (isAlreadyReported) {
      return res
        .status(400)
        .json({ message: "You have already reported this post" });
    }

    post.reports.push({ user: userId, reason });
    await post.save();

    await Notification.create({
      from: userId,
      to: null,
      post: postId,
      type: "report",
      reason,
    });

    res.status(200).json({
      message: "Post reported successfully",
      post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const { userId } = req.user;

    if (!text) {
      return res.status(400).json({ message: "Please provide text to update" });
    }

    const post = await Post.findOne({ "comments._id": commentId });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    comment.text = text;

    await post.save();

    res.status(200).json({ message: "Comment updated successfully", post });
  } catch (error) {
    console.error("Error in editComment controller:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const editPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text) {
      return res.status(400).json({ message: "Please provide text to update" });
    }

    const post = await Post.findById(postId).populate({
      path: "comments.user", // populate user trong comments
      select: "username fullName profileImg",
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.user.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to edit this post" });
    }

    post.text = text;

    await post.save();

    res.status(200).json({ message: "Post updated successfully", post });
  } catch (error) {
    console.error("Error in editPost controller:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const reportComment = async (req, res) => {
  try {
    const { reason } = req.body;
    const { userId } = req.user;
    const { commentId } = req.params;
    console.log(reason);

    const posts = await Post.find({ "comments._id": commentId });
    if (posts.length === 0) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const post = posts[0];

    const comment = post.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isAlreadyReported = comment.reports.some(
      (report) => report.user.toString() === userId
    );
    if (isAlreadyReported) {
      return res
        .status(400)
        .json({ message: "You have already reported this comment" });
    }

    comment.reports.push({ user: userId, reason });
    await post.save();

    res.status(200).json({
      message: "Comment reported successfully",
      post,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getPostById,
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
  reportComment,
  editPost,
};
