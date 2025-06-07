import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { getReceiverSocketId, io } from "../lib/socket.js";
import Notification from "../models/notification.model.js";
import cloudinary from "cloudinary"; // Nếu bạn đang dùng cloudinary, nhớ import đúng cách và cấu hình

export const signupAdmin = async (req, res) => {
  try {
    const { username, fullname, password, email } = req.body;
    if (!username || !fullname || !password || !email) {
      return res.status(400).json({
        message: "Please fill all the fields",
      });
    }
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({
        message: "Username already exists",
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      username,
      fullname,
      password: hashedPassword,
      email,
      role: "admin",
    });

    if (newUser) {
      const accessToken = jwt.sign(
        { userId: newUser._id, role: newUser.role },
        process.env.JWT_SECRET,
        {
          expiresIn: "72h",
        }
      );
      await newUser.save();
      res.status(200).json({
        message: "User created successfully",
        _Id: newUser._id,
        username: newUser.username,
        fullname: newUser.fullname,
        email: newUser.email,
        profileImg: newUser.profileImg,
        coverImg: newUser.coverImg,
        bio: newUser.bio,
        link: newUser.link,
        user: newUser,
        role: newUser.role,
        accessToken,
      });
    } else {
      res.status(400).json({
        message: "User not created",
      });
    }
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({
        message: "Please fill all the fields",
      });
    }
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Invalid password",
      });
    }

    if (user.role === "user") {
      return res.status(400).json({
        message: "You are not authorized to login as admin",
      });
    }
    const accessToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "72h",
      }
    );
    res.status(200).json({
      message: "Login successful",
      _Id: user._id,
      username: user.username,
      fullname: user.fullname,
      email: user.email,
      profileImg: user.profileImg,
      coverImg: user.coverImg,
      bio: user.bio,
      link: user.link,
      role: user.role,
      user: user,
      accessToken,
    });
  } catch (error) {
    console.log("Error in login controller", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const logout = (req, res) => {
  try {
    res.status(200).json({
      message: "Logout successful",
    });
  } catch (error) {
    console.log("Error in logout controller", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.status(200).json({
      message: "Users retrieved successfully",
      users: users,
    });
  } catch (error) {
    console.log("Error in getAllUsers controller:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const blockUser = async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.isBlocked === "" || user.isBlocked === null) {
      user.isBlocked = true;
      const notification = new Notification({
        to: userId,
        from: req.user.userId,
        message: "Your account has been blocked by an admin.",
        type: "block",
      });
      await notification.save();
    } else {
      user.isBlocked = !user.isBlocked;
      if (user.isBlocked) {
        const notification = new Notification({
          to: userId,
          from: req.user.userId,
          message: "Your account has been blocked by an admin.",
          type: "block",
        });
        await notification.save();
      } else {
        const notification = new Notification({
          to: userId,
          from: req.user.userId,
          message: "Your account has been unblocked by an admin.",
          type: "unblock",
        });
        await notification.save();
      }
    }
    await user.save();

    io.to(userId).emit("userBlocked", {
      message: "Your account has been blocked by an admin.",
    });

    res.status(200).json({ message: "User has been blocked", user });
  } catch (error) {
    console.log("Decoded user:", req.user);
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fullname, bio, profileImg, coverImg, email, password, role } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (profileImg) {
      const uploadedResponse = await cloudinary.uploader.upload(profileImg);
      user.profileImg = uploadedResponse.secure_url;
    }

    if (coverImg) {
      const uploadedResponse = await cloudinary.uploader.upload(coverImg);
      user.coverImg = uploadedResponse.secure_url;
    }

    if (fullname) user.fullname = fullname;
    if (bio) user.bio = bio;
    if (email) user.email = email;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    if (role) {
      if (req.user.role === "admin" || req.user.role === "super-admin") {
        user.role = role;
      } else {
        return res
          .status(403)
          .json({ message: "Access denied. Only admin can change role." });
      }
    }

    await user.save();

    res.status(200).json({
      message: "User profile updated successfully",
      user: user,
    });
  } catch (error) {
    console.error("Error in updateUserProfile controller:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export const updateRoleAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (user.role === "user") {
      user.role = "admin";
      await user.save();
      res.status(200).json({
        message: "User role updated to admin successfully",
        user: user,
      });
    } else if (user.role === "admin") {
      user.role = "user";
      await user.save();
      res.status(200).json({
        message: "User role updated to user successfully",
        user: user,
      });
    }
  } catch (error) {
    console.error("Error in updateAdmin controller:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
