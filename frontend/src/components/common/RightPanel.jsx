import { Link } from "react-router-dom";
import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import { USERS_FOR_RIGHT_PANEL } from "../../utils/db/dummy";
import { use, useEffect, useState } from "react";
import axiosInstance from "../../apis/axiosInstance";
import { set } from "mongoose";
import LoadingSpinner from "./LoadingSpinner";
import { useChatStore } from "../../store/useChatStore";

const RightPanel = () => {
  // const [isLoading, setIsLoading] = useState(true);
  // const [users, setUsers] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const {isLoadingUserSuggested: isLoading, suggested, userSuggested: users, handleFollow : handle} = useChatStore();
  useEffect(() => {
    const fetchData = async () => {
      await suggested();
    };
    fetchData();
  }, [refresh, suggested]);
  const handleFollow = async (userId) => {
    try {
      // const response = await axiosInstance.post(`/api/users/follow/${userId}`);
      await handle(userId);
      setRefresh((prev) => !prev);
      // setIsLoading(true);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  return (
    <div className="hidden lg:block my-4 mx-1">
      <div className="bg-[#16181C] p-4 rounded-md sticky top-2">
        <p className="font-bold">Who to follow</p>
        <div className="flex flex-col gap-4">
          {/* item */}
          {isLoading && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}
          {!isLoading &&
            users?.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-4"
                key={user._id}
              >
                <div className="flex gap-2 items-center">
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img src={user.profileImg || "/avatar-placeholder.png"} />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold tracking-tight truncate w-28">
                      {user.fullname.slice(0, 10)}
                    </span>
                    <span className="text-sm text-slate-500">
                      {user.email.slice(0, 10)+"..."}
                    </span>
                  </div>
                </div>
                <div>
                  <button
                    className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleFollow(user._id);
                    }}
                  >
                    {isLoading ? <LoadingSpinner size="sm" /> : "Follow"}
                  </button>
                </div>
              </Link>
            ))}
        </div>
      </div>
    </div>
  );
};
export default RightPanel;
