import { FaEye, FaEyeSlash, FaRegComment } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAdminStore } from "../../../store/useAdmin";
import { formatPostDate } from "../../../utils/date";

const PostAdmin = ({ post, postKey }) => {
  const { authUser: user, deletePost, deleteComment, hideUnhidePost } = useAdminStore();
  const [comment, setComment] = useState("");
  const postOwner = post.user;
  console.log("post", post);
  console.log("postOwner", postOwner);
  const isLiked = post.likes.includes(user?._id);

  const isMyPost = user?._id === post.user._id;

  const formattedDate = formatPostDate(post.createdAt);

  const isCommenting = false;

  const handleDeletePost = async () => {
    await deletePost(post._id);
  };

  const handleDeleteComment = async (commentId) => {
    await deleteComment(commentId);
  };

  const handleToggleHidePost = async () => {
    try {
      const response = await hideUnhidePost(post._id);
    } catch (error) {
      console.error("Error toggling post visibility:", error);
    }
  }

  // const handlePostComment = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const response = await axiosInstance.post(
  //       `/api/posts/comment/${post._id}`,
  //       {
  //         text: comment,
  //       }
  //     );
  //     console.log(response);
  //     if (response.status === 200) {
  //       console.log("Comment posted successfully");
  //       setComment("");
  //       toast.success("Comment posted successfully");
  //       onDelete();
  //     } else {
  //       console.error("Error posting comment");
  //     }
  //   } catch (error) {
  //     console.error("Error posting comment:", error);
  //   }
  // };

  // const handleLikePost = async () => {
  //   try {
  //     const response = await axiosInstance.post(`/api/posts/like/${post._id}`);
  //     if (response.status === 200) {
  //       console.log("Post liked successfully");
  //     } else {
  //       console.error("Error liking post");
  //     }
  //     onDelete();
  //   } catch (error) {
  //     console.error("Error liking post:", error);
  //   }
  // };

  return (
    <>
      {postKey === "RPPosts" && (
        <div className="bg-red-100 text-red-800 p-2 rounded mb-4">
          <p className="text-sm">
            This post has been reported. Please review it carefully.
          </p>
          {post.reports.map((report) => (
            <div key={report._id} className="text-xs">
              <span className="font-bold">{report.user.fullname}</span>:
              <span> {report.reason}</span>
            </div>))}
        </div>
      )}
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <div className="avatar">
          <Link
            to={`/admin/profile/${postOwner.username}`}
            className="w-8 rounded-full overflow-hidden"
          >
            <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link
              to={`/admin/profile/${postOwner.username}`}
              className="font-bold"
            >
              {postOwner.fullName}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <Link to={`/admin/profile/${postOwner.username}`}>
                @{postOwner.username}
              </Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>

            <span className="flex justify-end flex-1 gap-3">
              {post.isHidden ? (
                <FaEye
                  className="cursor-pointer hover:text-yellow-500"
                  onClick={handleToggleHidePost}
                  title="Unhide Post"
                />
              ) : (
                <FaEyeSlash
                  className="cursor-pointer hover:text-yellow-500"
                  onClick={handleToggleHidePost}
                  title="Hide Post"
                />
              )}
              {/* <FaTrash
                className="cursor-pointer hover:text-red-500"
                onClick={handleDeletePost}
                title="Delete Post"
              /> */}
            </span>
          </div>
          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.text}</span>
            {post.image && (
              <img
                src={post.image}
                className="h-80 object-contain rounded-lg border border-gray-700"
                alt=""
              />
            )}
          </div>
          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() =>
                  document
                    .getElementById("comments_modal" + post._id)
                    .showModal()
                }
              >
                <FaRegComment className="w-4 h-4  text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {post.comments.length}
                </span>
              </div>
              {/* We're using Modal Component from DaisyUI */}
              <dialog
                id={`comments_modal${post._id}`}
                className="modal border-none outline-none"
              >
                <div className="modal-box rounded border border-gray-600">
                  <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
                  <div className="flex flex-col gap-3 max-h-60 overflow-auto">
                    {post.comments.length === 0 && (
                      <p className="text-sm text-slate-500">
                        No comments yet 🤔 Be the first one 😉
                      </p>
                    )}
                    {post.comments.map((comment) => (
                      <div
                        key={comment._id}
                        className="relative flex gap-2 items-start p-2 border rounded-md"
                      >
                        {/* Nút xóa ở góc phải trên */}
                        <button
                          className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                          onClick={() => handleDeleteComment(comment._id)}
                        >
                          <FaTrash />
                        </button>

                        <div className="avatar">
                          <div className="w-8 rounded-full">
                            <img
                              src={
                                comment.user.profileImg ||
                                "/avatar-placeholder.png"
                              }
                              alt="avatar"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <span className="font-bold">
                              {comment.user.fullName}
                            </span>
                            <span className="text-gray-700 text-sm">
                              @{comment.user.username}
                            </span>
                          </div>
                          <div className="text-sm">{comment.text}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                  <button className="outline-none">close</button>
                </form>
              </dialog>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default PostAdmin;
