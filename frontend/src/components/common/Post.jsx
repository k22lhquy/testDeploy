import { FaRegComment, FaRegHeart, FaRegBookmark, FaTrash } from "react-icons/fa";
import { BiRepost } from "react-icons/bi";
import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../apis/axiosInstance";
import toast from "react-hot-toast";
import { formatPostDate } from "../../utils/date";
import { useChatStore } from "../../store/useChatStore";

const Post = ({ post, onDelete }) => {
  const { authUser: user, reportPost, reportComments, editCommentStore } = useChatStore();
  const [comment, setComment] = useState("");
  const [reportText, setReportText] = useState("");
  const [reportComment, setReportComment] = useState("");
  const [commentToReport, setCommentToReport] = useState("");
  const [editComment, setEditComment] = useState("");
  const [updatedComments, setUpdatedComments] = useState(post.comments);

  const reportPostModalRef = useRef(null);
  const reportCommentModalRef = useRef(null);
  const commentsModalRef = useRef(null);
  const editCommentModalRef = useRef(null);

  const postOwner = post.user;
  const isLiked = post.likes.includes(user?._id);
  const isMyPost = user?._id === post.user._id;
  const formattedDate = formatPostDate(post.createdAt);
  console.log("Post owner:", postOwner.username);

  const handleDeletePost = async () => {
    const response = await axiosInstance.delete(`/api/posts/${post._id}`);
    if (response.status === 200) {
      onDelete();
    } else {
      console.error("Error deleting post");
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(`/api/posts/comment/${post._id}`, { text: comment });
      if (response.status === 200) {
        setComment("");
        toast.success("Comment posted successfully");
        onDelete(); // optional: or manually append new comment
      }
    } catch (error) {
      console.error("Error posting comment:", error);
    }
  };

  const handleLikePost = async () => {
    try {
      const response = await axiosInstance.post(`/api/posts/like/${post._id}`);
      if (response.status === 200) {
        onDelete();
      }
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleSubmitReport = async () => {
    await reportPost(reportText, post._id);
    reportPostModalRef.current?.close();
    setReportText("");
  };

  const handleSubmitReportComment = async () => {
    if (commentToReport) {
      await reportComments(reportComment, commentToReport);
      setCommentToReport(null);
      setReportComment("");
      reportCommentModalRef.current?.close();
    }
  };

  const handleEditComment = async () => {
    if (commentToReport) {
      await editCommentStore(editComment, commentToReport);
      setUpdatedComments((prev) =>
        prev.map((c) =>
          c._id === commentToReport ? { ...c, text: editComment } : c
        )
      );
      setCommentToReport(null);
      setEditComment("");
      editCommentModalRef.current?.close();
    }
  };

  return (
    <>
      <div className="flex gap-2 items-start p-4 border-b border-gray-700">
        <div className="avatar">
          <Link to={`/profile/${postOwner.username}`} className="w-8 rounded-full overflow-hidden">
            <img src={postOwner.profileImg || "/avatar-placeholder.png"} />
          </Link>
        </div>
        <div className="flex flex-col flex-1">
          <div className="flex gap-2 items-center">
            <Link to={`/profile/${postOwner.username}`} className="font-bold">
              {postOwner.fullName}
            </Link>
            <span className="text-gray-700 flex gap-1 text-sm">
              <Link to={`/profile/${postOwner.username}`}>@{postOwner.username}</Link>
              <span>·</span>
              <span>{formattedDate}</span>
            </span>
            <span className="flex justify-end flex-1">
              {isMyPost ? (
                <FaTrash className="cursor-pointer hover:text-red-500" onClick={handleDeletePost} />
              ) : (
                <button
                  className="text-yellow-500 hover:text-yellow-400 font-bold text-lg"
                  title="Report this post"
                  onClick={() => reportPostModalRef.current?.showModal()}
                >
                  !
                </button>
              )}
            </span>
          </div>

          <div className="flex flex-col gap-3 overflow-hidden">
            <span>{post.text}</span>
            {post.image && (
              <img src={post.image} className="h-80 object-contain rounded-lg border border-gray-700" />
            )}
          </div>

          <div className="flex justify-between mt-3">
            <div className="flex gap-4 items-center w-2/3 justify-between">
              <div
                className="flex gap-1 items-center cursor-pointer group"
                onClick={() => commentsModalRef.current?.showModal()}
              >
                <FaRegComment className="w-4 h-4 text-slate-500 group-hover:text-sky-400" />
                <span className="text-sm text-slate-500 group-hover:text-sky-400">
                  {updatedComments.length}
                </span>
              </div>

              <div className="flex gap-1 items-center group cursor-pointer">
                <BiRepost className="w-6 h-6 text-slate-500 group-hover:text-green-500" />
                <span className="text-sm text-slate-500 group-hover:text-green-500">0</span>
              </div>

              <div className="flex gap-1 items-center group cursor-pointer" onClick={handleLikePost}>
                <FaRegHeart className={`w-4 h-4 ${isLiked ? "text-pink-500" : "text-slate-500"} group-hover:text-pink-500`} />
                <span className={`text-sm ${isLiked ? "text-pink-500" : "text-slate-500"} group-hover:text-pink-500`}>
                  {post.likes.length}
                </span>
              </div>
            </div>
            <div className="flex w-1/3 justify-end gap-2 items-center">
              <FaRegBookmark className="w-4 h-4 text-slate-500 cursor-pointer" />
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <dialog ref={reportPostModalRef} className="modal">
        <div className="modal-box border border-gray-700">
          <h3 className="font-bold text-lg mb-4">Report Post</h3>
          <textarea
            className="textarea w-full border border-gray-600 p-2 rounded"
            placeholder="Why are you reporting this post?"
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
          />
          <div className="modal-action mt-4">
            <form method="dialog"><button className="btn">Cancel</button></form>
            <button onClick={handleSubmitReport} className="btn btn-error text-white">Submit Report</button>
          </div>
        </div>
      </dialog>

      <dialog ref={reportCommentModalRef} className="modal">
        <div className="modal-box border border-gray-700">
          <h3 className="font-bold text-lg mb-4">Report Comment</h3>
          <textarea
            className="textarea w-full border border-gray-600 p-2 rounded"
            placeholder="Why are you reporting this comment?"
            value={reportComment}
            onChange={(e) => setReportComment(e.target.value)}
          />
          <div className="modal-action mt-4">
            <form method="dialog"><button className="btn">Cancel</button></form>
            <button onClick={handleSubmitReportComment} className="btn btn-error text-white">Submit Report</button>
          </div>
        </div>
      </dialog>

      <dialog ref={editCommentModalRef} className="modal">
        <div className="modal-box border border-gray-700">
          <h3 className="font-bold text-lg mb-4">Edit Comment</h3>
          <textarea
            className="textarea w-full border border-gray-600 p-2 rounded"
            placeholder="Edit your comment..."
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
          />
          <div className="modal-action mt-4">
            <form method="dialog"><button className="btn">Cancel</button></form>
            <button onClick={handleEditComment} className="btn btn-error text-white">Submit Edit</button>
          </div>
        </div>
      </dialog>

      <dialog ref={commentsModalRef} className="modal border-none outline-none">
        <div className="modal-box rounded border border-gray-600">
          <h3 className="font-bold text-lg mb-4">COMMENTS</h3>
          <div className="flex flex-col gap-3 max-h-60 overflow-auto">
            {updatedComments.length === 0 ? (
              <p className="text-sm text-slate-500">No comments yet 🤔 Be the first one 😉</p>
            ) : (
              updatedComments.map((c) => (
                <div key={c._id} className="relative flex gap-2 items-start">
                  {c.user._id !== user?._id && (
                    <button
                      className="absolute top-0 right-0 text-yellow-500 hover:text-yellow-400 font-bold text-lg"
                      title="Report this comment"
                      onClick={() => {
                        setCommentToReport(c._id);
                        reportCommentModalRef.current?.showModal();
                      }}
                    >
                      !
                    </button>
                  )}
                  {c.user._id === user?._id && (
                    <button
                      className="absolute top-0 right-0 text-yellow-500 hover:text-yellow-400 font-bold text-lg"
                      title="Edit this comment"
                      onClick={() => {
                        setCommentToReport(c._id);
                        setEditComment(c.text);
                        editCommentModalRef.current?.showModal();
                      }}
                    >
                      ...
                    </button>
                  )}
                  <div className="avatar">
                    <div className="w-8 rounded-full">
                      <img src={c.user.profileImg || "/avatar-placeholder.png"} alt="avatar" />
                    </div>
                  </div>
                  <div className="flex flex-col w-full pr-5">
                    <div className="flex items-center gap-1">
                      <span className="font-bold">{c.user.fullName}</span>
                      <span className="text-gray-700 text-sm">@{c.user.username}</span>
                    </div>
                    <div className="text-sm">{c.text}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <form className="flex gap-2 items-center mt-4 border-t border-gray-600 pt-2" onSubmit={handlePostComment}>
            <textarea
              className="textarea w-full p-1 rounded text-md resize-none border focus:outline-none border-gray-800"
              placeholder="Add a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <button className="btn btn-primary rounded-full btn-sm text-white px-4">Comment</button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};

export default Post;
