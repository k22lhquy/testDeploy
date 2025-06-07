import mongoose from "mongoose";
const { Schema } = mongoose;

const DeletedPostSchema = new Schema({
  originalPostId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  text: String,
  image: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      text: String,
    },
  ],
  reports: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      reason: String,
      createdAt: Date,
    },
  ],
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deletedAt: { type: Date, default: Date.now },
});

const DeletedPost = mongoose.model("DeletedPost", DeletedPostSchema);

export default DeletedPost ;
