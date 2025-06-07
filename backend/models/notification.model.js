import mongoose from "mongoose";
const { Schema } = mongoose;

const NotificationSchema = new Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Có thể là hệ thống
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Admin
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: false, // Chỉ dùng nếu là thông báo flag
    },
    type: {
      type: String,
      enum: [
        "follow",
        "like",
        "block",
        "unblock",
        "report",
        "moderation",
        "other",
      ],
      required: true,
    },
    reason: {
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);

export default Notification ;
