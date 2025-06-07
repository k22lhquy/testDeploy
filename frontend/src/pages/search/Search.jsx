import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useChatStore } from "../../store/useChatStore";
import PostSkeleton from "../../components/skeletons/PostSkeleton";
import Post from "../../components/common/Post";
import RightPanelSkeleton from "../../components/skeletons/RightPanelSkeleton";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import axiosInstance from "../../apis/axiosInstance";

const Search = () => {
  const {
    isLoadingPOST: isLoading,
    searchPosts,
    POSTS,
    authUser
  } = useChatStore();
  const {
    isLoadingUserSuggested,
    searchUsers,
    handleFollow: handle,
    usersSearch: users,
  } = useChatStore();

  const [isLoadingg, setIsLoadingg] = useState(true);
  const [searchParams] = useSearchParams();
  const searchValue = searchParams.get("search");
  const [refresh, setRefresh] = useState(false);

  const handleRefresh = () => {
    setRefresh((prev) => !prev);
  };


  const handleFollow = async (userId) => {
    try {
      const response = await axiosInstance.post(`/api/users/follow/${userId}`);
      setRefresh((prev) => !prev);
      setIsLoadingg(true);
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setIsLoadingg(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingg(true);
        await searchPosts(searchValue);
        await searchUsers(searchValue);
      }
      catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoadingg(false);
      }
    };
    fetchData();
  }, [refresh]);

  return (
    <div className="flex-[4_4_0] border-l border-r border-gray-700 min-h-screen text-white ">
      {/* Header */}
      <div className="flex justify-center items-center px-4 py-3 border-b border-gray-700">
        <p className="font-bold text-xl">Search Results</p>
      </div>

      {/* USERS Section */}
      <div className="py-4 border-b border-gray-700">
        <h2 className="text-center text-lg font-semibold mb-4 text-gray-300">Users</h2>
        <div className="px-4 space-y-3">
          {isLoadingUserSuggested && (
            <>
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
              <RightPanelSkeleton />
            </>
          )}

          {!isLoadingUserSuggested &&
            users?.map((user) => (
              <Link
                to={`/profile/${user.username}`}
                className="flex items-center justify-between gap-4 p-2 hover:bg-gray-800 rounded-lg transition duration-200"
                key={user._id}
              >
                <div className="flex gap-3 items-center">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <img
                      src={user.profileImg || "/avatar-placeholder.png"}
                      alt={user.fullname}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold truncate w-32">{user.fullname}</span>
                    <span className="text-sm text-gray-400">@{user.username}</span>
                  </div>
                </div>
                <button
                  className="btn bg-white text-black hover:opacity-90 rounded-full btn-sm px-4 py-1 text-sm font-medium"
                  onClick={(e) => {
                    e.preventDefault();

                    handleFollow(user._id);
                  }}
                >
                  {user?.followers?.includes(authUser._id) ? "Unfollow" : "Follow"}
                </button>
              </Link>
            ))}
        </div>
      </div>

      {/* POSTS Section */}
      <div className="py-4">
        <h2 className="text-center text-lg font-semibold mb-4 text-gray-300">Posts</h2>
        <div className="px-4">
          {isLoading && (
            <div className="flex flex-col gap-4 mt-4">
              <PostSkeleton />
              <PostSkeleton />
              <PostSkeleton />
            </div>
          )}

          {!isLoading && POSTS?.length === 0 && (
            <p className="text-center my-6 text-gray-400">
              No posts found. Try something else 👻
            </p>
          )}

          {!isLoading &&
            POSTS?.map((post) => (
              <Post key={post._id} post={post} onDelete={handleRefresh} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default Search;
