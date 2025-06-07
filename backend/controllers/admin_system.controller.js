import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import { v2 as cloudinary } from "cloudinary";
import Notification from "../models/notification.model.js";
import DeletedPost from "../models/deletelog.model.js";
import FlaggedContent from "../moderation/FlaggedContent.js";

const getUserActivities = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    const comments = posts.reduce((acc, post) => {
      post.comments.forEach((comment) => {
        if (comment.user.toString() === userId) {
          acc.push(comment);
        }
      });
      return acc;
    }, []);

    res.status(200).json({
      message: "User activities retrieved successfully",
      posts,
      comments,
    });
  } catch (error) {
    console.error("Error in getUserActivities controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAdminReports = async (req, res) => {
  try {
    const blockedUsers = await User.countDocuments({ isBlocked: true });
    const unblockedUsers = await User.countDocuments({ isBlocked: false });

    const totalReportedPosts = await Post.countDocuments({
      "reports.0": { $exists: true },
    });

    const frequentlyReportedComments = await Post.aggregate([
      { $unwind: "$comments" },
      {
        $addFields: {
          reportsSafe: { $ifNull: ["$comments.reports", []] },
        },
      },
      {
        $match: {
          $expr: { $gt: [{ $size: "$reportsSafe" }, 3] },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "comments.user",
          foreignField: "_id",
          as: "user",
        },
      },
      { $unwind: "$user" },
      {
        $lookup: {
          from: "users",
          localField: "comments.reports.user",
          foreignField: "_id",
          as: "reportUsers",
        },
      },
      {
        $project: {
          text: 1,
          createdAt: 1,
          user: { username: "$user.username", email: "$user.email" },
          reports: {
            $map: {
              input: "$comments.reports",
              as: "report",
              in: {
                user: {
                  username: {
                    $arrayElemAt: [
                      "$reportUsers.username",
                      { $indexOfArray: ["$reportUsers._id", "$$report.user"] },
                    ],
                  },
                  email: {
                    $arrayElemAt: [
                      "$reportUsers.email",
                      { $indexOfArray: ["$reportUsers._id", "$$report.user"] },
                    ],
                  },
                },
                reason: "$$report.reason",
                createdAt: "$$report.createdAt",
              },
            },
          },
        },
      },
    ]);

    const mostReportedUsers = await Post.aggregate([
      { $match: { "reports.0": { $exists: true } } },
      {
        $group: {
          _id: "$user",
          reportedPosts: { $sum: 1 },
        },
      },
      { $sort: { reportedPosts: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 0,
          userId: "$userInfo._id",
          username: "$userInfo.username",
          email: "$userInfo.email",
          reportedPosts: 1,
        },
      },
    ]);

    const mostReportedCommentUsers = await Post.aggregate([
      { $unwind: "$comments" },
      { $match: { "comments.reports.0": { $exists: true } } },
      {
        $group: {
          _id: "$comments.user",
          reportedComments: { $sum: 1 },
        },
      },
      { $sort: { reportedComments: -1 } },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      { $unwind: "$userInfo" },
      {
        $project: {
          _id: 0,
          userId: "$userInfo._id",
          username: "$userInfo.username",
          email: "$userInfo.email",
          reportedComments: 1,
        },
      },
    ]);

    res.status(200).json({
      message: "Admin reports summary",
      overview: {
        blockedUsers,
        unblockedUsers,
        totalReportedPosts,
      },
      frequentlyReportedComments,
      mostReportedUsers,
      mostReportedCommentUsers,
    });
  } catch (error) {
    console.error("Error in getAdminReports:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUserEvents = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const posts = await Post.find({ user: userId }).sort({ createdAt: -1 });

    const likedPosts = await Post.find({ _id: { $in: user.likedPosts } }).sort({
      createdAt: -1,
    });

    const commentsOnPosts = await Post.find({ "comments.user": userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      message: "User events retrieved successfully",
      posts,
      likedPosts,
      commentsOnPosts,
    });
  } catch (error) {
    console.error("Error in getUserEvents controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: new Date(new Date() - 24 * 60 * 60 * 1000) },
    });

    const popularPosts = await Post.find().sort({ likes: -1 }).limit(5);

    res.status(200).json({
      message: "Analytics retrieved successfully",
      activeUsers,
      popularPosts,
    });
  } catch (error) {
    console.error("Error in getAnalytics controller:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getAllFlaggedPosts = async (req, res) => {
  try {
    const flagged = await FlaggedContent.find()
      .sort({ detectedAt: -1 })
      .populate({
        path: "post",
        populate: {
          path: "user",
          select: "username profileImg",
        },
        select: "text image createdAt",
      })
      .populate({
        path: "reviewedBy",
        select: "username profileImg",
      });

    const filtered = flagged.filter((item) => item.post !== null);

    res.status(200).json(filtered);
  } catch (err) {
    console.error("Failed to fetch flagged posts:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getUserActivities,
  getAdminReports,
  getUserEvents,
  getAnalytics,
  getAllFlaggedPosts,
};
