import XSvg from "../svgs/X";

import { MdMessage } from "react-icons/md";
import { MdHomeFilled } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { BiLogOut } from "react-icons/bi";
import axiosInstance from "../../apis/axiosInstance";
import { toast } from "react-hot-toast";
import { useEffect, useState } from "react";
import { useChatStore } from "../../store/useChatStore";

const Sidebar = () => {
  const { authUser: data, disconnectSocket } = useChatStore();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const logout = async () => {
    localStorage.clear();
    navigate("/login");
    disconnectSocket();
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      navigate(`/search?search=${search}`);
    }
  };

  return (
    <div className="md:flex-[2_2_0] w-18 max-w-52">
      <div className="sticky top-0 left-0 h-screen flex flex-col border-r border-gray-700 w-20 md:w-full">
        <div className="flex justify-between md:justify-start items-center">
          <Link to="/" className="flex justify-center md:justify-start">
            <XSvg className="px-2 w-12 h-12 rounded-full fill-white hover:bg-stone-900" />
          </Link>
          <label className="input">
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
              onKeyDown={handleKeyDown}
              onChange={({ target }) => {
                setSearch(target.value);
                
              }}
            />
          </label>
        </div>
        <ul className="flex flex-col gap-3 mt-4">
          <li className="flex justify-center md:justify-start">
            <Link
              to="/"
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <MdHomeFilled className="w-8 h-8" />
              <span className="text-lg hidden md:block">Home</span>
            </Link>
          </li>
          <li className="flex justify-center md:justify-start">
            <Link
              to="/notifications"
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <IoNotifications className="w-6 h-6" />
              <span className="text-lg hidden md:block">Notifications</span>
            </Link>
          </li>

          <li className="flex justify-center md:justify-start">
            <Link
              to={`/profile/${data?.username}`} // profile/me
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <FaUser className="w-6 h-6" />
              <span className="text-lg hidden md:block">Profile</span>
            </Link>
          </li>

          <li className="flex justify-center md:justify-start">
            <Link
              to={`/message`}
              className="flex gap-3 items-center hover:bg-stone-900 transition-all rounded-full duration-300 py-2 pl-2 pr-4 max-w-fit cursor-pointer"
            >
              <MdMessage className="w-6 h-6" />
              <span className="text-lg hidden md:block">message</span>
            </Link>
          </li>
        </ul>
        {data && (
          <div className="mt-auto mb-10 flex flex-col gap-2 px-4">
            <Link
              to={`/profile/${data.username}`}
              className="flex gap-2 items-start transition-all duration-300 hover:bg-[#181818] py-2 px-2 rounded-full"
            >
              <div className="avatar hidden md:inline-flex">
                <div className="w-8 rounded-full">
                  <img src={data?.profileImg || "/avatar-placeholder.png"} />
                </div>
              </div>
              <div className="hidden md:block">
                <p className="text-white font-bold text-sm w-20 truncate">
                  {data?.fullname}
                </p>
                <p className="text-slate-500 text-sm">{data?.email}</p>
              </div>
            </Link>

            <div
              className="flex items-center gap-2 cursor-pointer hover:bg-[#181818] py-2 px-2 rounded-full text-red-400"
              onClick={logout}
            >
              <BiLogOut className="w-5 h-5" />
              <span className="hidden md:inline-block text-sm">Logout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Sidebar;
