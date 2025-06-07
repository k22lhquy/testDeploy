import Post from "../models/post.model.js";
import User from "../models/user.model.js";

const searchUsers = async (req, res) => {
  const { userId } = req.user;
  const { search } = req.query;

  if (!search) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const users = await User.find({
      $or: [{ fullname: { $regex: search, $options: "i" } }],
      _id: { $ne: userId },
    }).select("-password");

    res.status(200).json({ users });
  } catch (error) {
    console.error("Error searching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const searchPosts = async (req, res) => {
  const search = req.query.search?.trim();
  const { userId } = req.user;
  if (!search) {
    return res.status(400).json({ message: "Search query is required" });
  }

  try {
    const posts = await Post.find({
      $or: [{ text: { $regex: search, $options: "i" } }],
      isHidden: false,
    });

    res.status(200).json({ posts });
  } catch (error) {
    console.error("Error searching posts:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export { searchUsers, searchPosts };
