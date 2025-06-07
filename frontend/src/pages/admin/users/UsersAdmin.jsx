import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAdminStore } from "../../../store/useAdmin";

const UsersAdmin = () => {
  const isLoadingUserSuggested = false;
  const authUser = {};
  const { users, getAllUsers } = useAdminStore();
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      await getAllUsers();
    };
    fetchUsers();
  }, []);
  const filteredUsers = users.filter((user) => {
    return user.fullname.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="py-4 border-b border-gray-700">
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
        Users
      </h2>
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
          filteredUsers?.map((user) => (
            <Link
              to={`/admin/profile/${user.username}`}
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
                  <span className="font-semibold truncate w-32">
                    {user.fullname}
                  </span>
                  <span className="text-sm text-gray-400">
                    @{user.username}
                  </span>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
};

export default UsersAdmin;
