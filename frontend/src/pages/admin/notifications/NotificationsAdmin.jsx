import React, { useEffect, useState } from "react";
import { IoSettingsOutline } from "react-icons/io5";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import axiosInstance from "../../../apis/axiosInstance";
import { FaHeart, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useAdminStore } from "../../../store/useAdmin";
import toast from "react-hot-toast";
import PostAdmin from "../posts/PostAdmin";

const NotificationsAdmin = () => {
  const {
    authUser: user,
    getNotifications,
    deleteAllNotifications,
  } = useAdminStore();
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const postDialog = React.useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [getNotifications]);

  const deleteNotifications = async () => {
    try {
      await deleteAllNotifications();
      setRefresh((prev) => !prev);
      setIsLoading(true);
      toast.success("Notifications deleted successfully");
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
          <div className="dropdown ">
            <div tabIndex={0} role="button" className="m-1">
              <IoSettingsOutline className="w-4" />
            </div>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={deleteNotifications}>Delete all notifications</a>
              </li>
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="flex justify-center h-full items-center">
            <LoadingSpinner size="lg" />
          </div>
        )}
        {notifications?.length === 0 && (
          <div className="text-center p-4 font-bold">No notifications 🤔</div>
        )}
        {notifications?.map((notification) => (
          <div className="border-b border-gray-700" key={notification._id}>
            <div className="flex gap-2 p-4">
              {/* <Link to={`/admin/profile/${notification.from.username}`}></Link> */}
              <div>
                <div className="avatar">
                  <div className="w-8 rounded-full">
                    <img
                      src={
                        notification.from.profileImg ||
                        "/avatar-placeholder.png"
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-1">
                  <Link to={`/admin/profile/${notification.from.username}`} className="font-bold">
                    @{notification.from.username}
                  </Link>{" "}
                  report post with reason {notification.reason}
                  <span onClick={() => postDialog.current.showModal()}
                  className="flex gap-2 cursor-pointer underline">(post)</span>
                </div>
              </div>
              {console.log(notification.post)}
              <dialog
                id="post"
                className="modal"
                ref={postDialog}
                onClick={(e) => {
                  if (e.target === postDialog.current) {
                    postDialog.current.close();
                  }
                }}
              >
                <div className="w-full max-w-5xl modal-box">
                  <PostAdmin post={notification.post} postKey={"abc"} />
                </div>
              </dialog>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default NotificationsAdmin;
