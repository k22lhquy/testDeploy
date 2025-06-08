import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

const getNotifications = async (req, res) => {
  try {
    const { userId } = req.user;
    const notifications = await Notification.find({ to: userId })
      .populate({ path: "from", select: "username profileImg" })
      .populate({ path: "post", select: "title image" }) 
      .sort({ createdAt: -1 });

    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};



const getNotificationsWeb = async (req, res) => {
  try {
    const { userId } = req.user;
    const notifications = await Notification.find({ to: userId })
      .populate({ path: "from" })
      .populate({
        path: "post",
        populate: {
          path: "user",
          model: "User",
        },
      })
      .sort({ createdAt: -1 });

    await Notification.updateMany({ to: userId }, { read: true });
    res.status(200).json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const deleteNotifications = async (req, res) => {
  try {
    const { userId } = req.user;
    await Notification.deleteMany({ to: userId });
    res.status(200).json({ message: "Notifications deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export {
  getNotifications,
  getNotificationsWeb,
  deleteNotifications,
};
