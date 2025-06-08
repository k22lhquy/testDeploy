import { Link } from "react-router-dom";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import { IoSettingsOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { FaHeart } from "react-icons/fa6";
import axiosInstance from "../../apis/axiosInstance";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import Post from "../../components/common/Post";

const NotificationPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const postDialog = useRef(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axiosInstance.get("/api/notifications/web");
        setNotifications(response.data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNotifications();
  }, [refresh]);

  const deleteNotifications = async () => {
    try {
      const response = await axiosInstance.delete(`/api/notifications/`);
      console.log(response);
      setRefresh((prev) => !prev);
      setIsLoading(true);
      toast.success("Notifications deleted successfully");
    } catch (error) {
      console.error("Error deleting notifications:", error);
    }
  };

  const handleRefresh = () => setRefresh((prev) => !prev);

  return (
    <>
      <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen">
        <div className="flex justify-between items-center p-4 border-b border-gray-700">
          <p className="font-bold">Notifications</p>
          <div className="dropdown">
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
                <div className="flex gap-1 flex-wrap">
                  <Link
                    to={`/profile/${notification.from.username}`}
                    className="font-bold"
                  >
                    @{notification.from.username}
                  </Link>{" "}
                  {notification.type === "follow" && (
                    <span className="text-gray-400">started following you</span>
                  )}
                  {notification.type === "like" && (
                    <>
                      <span className="text-gray-400">liked your</span>
                      {isLoading ? (
                        <span className="text-gray-400">loading...</span>) : (<span
                        onClick={() => {
                          setSelectedPost(notification.post);
                          postDialog.current?.showModal();
                        }}
                        className="flex gap-2 cursor-pointer underline"
                      >
                        (post)
                      </span>)}
                      
                    </>
                  )}
                  {notification.type === "block" && (
                    <span className="text-gray-400">blocked you</span>
                  )}
                  {notification.type === "unblock" && (
                    <span className="text-gray-400">unblocked you</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Post dialog */}
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
            {selectedPost && (
              <Post post={selectedPost} onRefresh={handleRefresh} />
            )}
          </div>
        </dialog>
      </div>
    </>
  );
};

export default NotificationPage;
