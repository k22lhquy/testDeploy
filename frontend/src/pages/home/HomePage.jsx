import { useEffect, useState } from "react";

import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import axiosInstance from "../../apis/axiosInstance";
import { useChatStore } from "../../store/useChatStore";

const HomePage = () => {
  const [feedType, setFeedType] = useState("forYou");
  const [user, setUser] = useState();
  const { authUser, checkAuth } = useChatStore()
  useEffect(() => {
    const fetchUser = async () => {
      try {
		const response = await axiosInstance.post(`/api/auth/me`);
		setUser(response.data);
	  }catch (error) {
		console.error("Error fetching user:", error);
	  }
    };
    fetchUser();
  }, []);
  return (
    <>
      <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen">
        {/* Header */}
        <div className="flex w-full border-b border-gray-700">
          <div
            className={
              "flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
            }
            onClick={() => setFeedType("forYou")}
          >
            For you
            {feedType === "forYou" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
          <div
            className="flex justify-center flex-1 p-3 hover:bg-secondary transition duration-300 cursor-pointer relative"
            onClick={() => setFeedType("following")}
          >
            Following
            {feedType === "following" && (
              <div className="absolute bottom-0 w-10  h-1 rounded-full bg-primary"></div>
            )}
          </div>
        </div>

        {/*  CREATE POST INPUT */}
        <CreatePost user={user} />

        {/* POSTS */}
        <Posts feedType={feedType} userId={user?._id}/>
      </div>
    </>
  );
};
export default HomePage;
