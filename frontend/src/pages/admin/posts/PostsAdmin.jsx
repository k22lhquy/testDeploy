import React, { useEffect, useState } from "react";
import PostSkeleton from "../../../components/skeletons/PostSkeleton";
import { useAdminStore } from "../../../store/useAdmin";
import PostAdmin from "./PostAdmin";

const PostsAdmin = () => {
  const { POSTS, isLoadingPosts: isLoading, getAllPosts } = useAdminStore();
  const postKey = "allPosts";
  useEffect(() => {
    const fetchPosts = async () => {
      await getAllPosts();
    };
    fetchPosts();
  }, []);
  const [search, setSearch] = useState("");
  const filteredPOSTS = POSTS.filter((POST) => {
    return POST.text.toLowerCase().includes(search.toLowerCase());
  });
  return (
    <div className="py-4">
      <label className="input w-full">
        <svg
          className="h-[1em] opacity-50"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <g
            strokeLinejoin="round"
            strokeLinecap="round"
            strokeWidth="2.5"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.3-4.3"></path>
          </g>
        </svg>
        <input
          type="search"
          required
          placeholder="Search"
          onChange={({ target }) => {
            setSearch(target.value);
          }}
        />
      </label>
      <h2 className="text-center text-lg font-semibold mb-4 text-gray-300">
        Posts
      </h2>
      <div className="px-4">
        {isLoading && (
          <div className="flex flex-col gap-4 mt-4">
            <PostSkeleton />
            <PostSkeleton />
            <PostSkeleton />
          </div>
        )}

        {!isLoading && filteredPOSTS?.length === 0 && (
          <p className="text-center my-6 text-gray-400">
            No posts found. Try something else 👻
          </p>
        )}

        {!isLoading &&
          filteredPOSTS?.map((post) => (
            <PostAdmin
              key={post._id}
              post={post}
              postKey={postKey}
            />
          ))}
      </div>
    </div>
  );
};

export default PostsAdmin;
