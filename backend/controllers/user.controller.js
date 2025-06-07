import User from "../models/user.model.js";
import Notification from "../models/notification.model.js";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";

const getUserProfile = async (req, res) => {
  try {
    const { username } = req.params;
    const user = await User.findOne({ username }).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getUser = async (req, res) => {
  try {
    let { id } = req.params;
    id = id.trim();

    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

const getSuggestedUsers = async (req, res) => {
  try {
    const { userId } = req.user;

    const usersFollowedByMe = await User.findById(userId).select("following");

    const users = await User.aggregate([
      {
        $match: {
          _id: { $ne: new mongoose.Types.ObjectId(userId) },
        },
      },
      { $sample: { size: 10 } },
      {
        $project: {
          password: 0,
        },
      },
    ]);

    const filteredUsers = users.filter(
      (user) => !usersFollowedByMe.following.includes(user._id)
    );

    const suggestedUsers = filteredUsers.slice(0, 4);

    res.status(200).json(suggestedUsers);
  } catch (error) {
    console.log("Error in getSuggestedUsers: ", error.message);
    res.status(500).json({ error: error.message });
  }
};

const followUnfollowUser = async (req, res) => {
  try {
    const { id } = req.params;
    const userToModify = await User.findById(id);
    const currentUser = await User.findById(req.user.userId);
    if (!userToModify || !currentUser) {
      return res.status(404).json({ message: "User not found" });
    }
    if (id === req.user.userId.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }
    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      currentUser.following.pull(userToModify._id);
      userToModify.followers.pull(currentUser._id);
      await currentUser.save();
      await userToModify.save();
      res.status(200).json({ message: "UnFollowed successfully" });
    } else {
      currentUser.following.push(userToModify._id);
      userToModify.followers.push(currentUser._id);
      await currentUser.save();
      await userToModify.save();
      const notification = new Notification({
        from: currentUser._id,
        to: userToModify._id,
        type: "follow",
      });
      await notification.save();

      res.status(200).json({ message: "Followed successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const {
      fullname,
      bio,
      link,
      email,
      username,
      currentPassword,
      newPassword,
    } = req.body;
    let { profileImg, coverImg } = req.body;

    const { userId } = req.user;
    let user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if ((newPassword && !currentPassword) || (!newPassword && currentPassword)) {
      return res.status(400).json({ message: "Please provide both current and new password" });
    }

    if (currentPassword && newPassword) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Current password is incorrect" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "New password must be at least 6 characters long" });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    if (profileImg) {
      if (user.profileImg) {
        const publicId = user.profileImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      profileImg = uploadedResponse.secure_url;
    }
    if (coverImg) {
      if (user.coverImg) {
        const publicId = user.coverImg.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      }
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      coverImg = uploadedResponse.secure_url;
    }

    user.fullname = fullname || user.fullname;
    user.bio = bio || user.bio;
    user.link = link || user.link;
    user.email = email || user.email;
    user.username = username || user.username;
    user.profileImg = profileImg || user.profileImg;
    user.coverImg = coverImg || user.coverImg;
    user = await user.save();
    user.password = null;
    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const changPassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const { userId } = req.user;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New password and confirm password do not match" });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ message: "New password cannot be the same as current password" });
    }
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    res.status(200).json({ message: "Password changed successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getUserProfile,
  getSuggestedUsers,
  followUnfollowUser,
  updateUserProfile,
  getUser,
  changPassword,
};
