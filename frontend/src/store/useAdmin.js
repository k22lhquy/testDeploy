import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import axiosInstance from "../apis/axiosInstance";
import { io } from "socket.io-client";

export const useAdminStore = create(
  persist(
    (set, get) => ({
      authUser: null,
      isLoggingIn: false,
      isLoadingUser: true,
      User: null,
      refresh: false,
      POSTS: [],
      isLoadingPOST: true,
      users: [],
      isUsersLoading: false,

      deleteAllNotifications: async () => {
        try {
          const response = await axiosInstance.delete("/api/admin/deleteAllNotification");
          if (response.status === 200) {
            toast.success("All notifications deleted successfully");
            get().getNotifications();
          } else {
            toast.error("Error deleting notifications");
          }
        } catch (error) {
          console.error("Error deleting notifications:", error);
        }
      },

      getNotifications: async () => {
        try {
          set({ isLoadingUser: true });
          const response = await axiosInstance.get("/api/admin/getAllNotification");
          set({ User: response.data.notifications });
          return response.data.notifications;
        } catch (error) {
          console.error("Error fetching notifications:", error);
        } finally {
          set({ isLoadingUser: false });
        }
      },

      fetchAnalytics: async () => {
        const res = await axiosInstance.get("/api/admin/analytics");
        return res.data;
      },

      fetchAdminReport: async () => {
        const res = await axiosInstance.get("/api/admin/reportedTotal");
        return res.data;
      },

      blockUser: async (userId) => {
        console.log(userId)
        try {
          const response = await axiosInstance.put(
            `/api/admin/block/${userId}`
          );
          set({ User: response.data.user });
          if (response.status === 200) {
            toast.success("User blocked successfully");
          } else {
            toast.error("Error blocking user");
          }
        } catch (error) {
          console.error("Error blocking user:", error);
        }
      },

      deleteComment: async (commentId) => {
        try {
          const response = await axiosInstance.delete(
            `/api/admin/comments/${commentId}`
          );
          if (response.status === 200) {
            toast.success("Post deleted successfully");
            get().getAllPosts();
          } else {
            toast.error("Error deleting post");
          }
        } catch (error) {
          console.error("Error deleting post:", error);
        }
      },

      hidePost: async (postId) => {
        try {
          const response = await axiosInstance.put(`/api/admin/posts/${postId}`);
          if (response.status === 200) {
            toast.success("Post hidden successfully");
            get().getAllPosts();
          } else {
            toast.error("Error hiding post");
          }
        } catch (error) {
          console.error("Error hiding post:", error);
        }
      },

      hideUnhidePost: async (postId) => {
        try {
          const response = await axiosInstance.get(
            `/api/admin/hideUnHidePost/${postId}`
          );
          if (response.status === 200) {
            if(response.data.Hidden) {
              toast.success("Post hidden successfully");
              get().getAllPosts();
            } else {
              toast.success("Post unhidden successfully");
              get().getHiddenPosts();
            }
          } else {
            toast.error("Error toggling post visibility");
          }
        } catch (error) {
          console.error("Error toggling post visibility:", error);
        }
      },

      getReportedPosts: async () => {
        try{
          set({ isLoadingPOST: true });
          const response = await axiosInstance.get(
            `/api/admin/reportedPosts`
          );
          set({ POSTS: response.data.posts });
        }catch (error) {
          console.error("Error fetching reported posts:", error);
        }finally {
          set({ isLoadingPOST: false });
        }
      },

      updateRoleAdmin: async (userId) => {
        try {
          const response = await axiosInstance.get(
            `/api/admin/updateRole/${userId}`
          );
        } catch (error) {
          console.error("Error updating user role:", error);
        }
      },

      deletePost: async (postId) => {
        try {
          const response = await axiosInstance.delete(
            `/api/admin/posts/${postId}`
          );
          if (response.status === 200) {
            toast.success("Post deleted successfully");
            get().getAllPosts();
          } else {
            toast.error("Error deleting post");
          }
        } catch (error) {
          console.error("Error deleting post:", error);
        }
      },

      getAllUsers: async () => {
        try {
          set({ isUsersLoading: true });
          const response = await axiosInstance.get("/api/admin/all");
          set({ users: response.data.users });
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getHiddenPosts: async () => {
        try {
          set({ isLoadingPOST: true });
          const response = await axiosInstance.get("/api/admin/hiddenPosts");
          set({ POSTS: response.data.hiddenPosts });
        } catch (error) {
          console.error("Error fetching hidden posts:", error);
        } finally {
          set({ isLoadingPOST: false });
        }
      },

      getAllPosts: async () => {
        try {
          set({ isLoadingPOST: true });
          const response = await axiosInstance.get("/api/posts/all");
          set({ POSTS: response.data.posts });
        } catch (error) {
          console.error("Error fetching posts:", error);
        } finally {
          set({ isLoadingPOST: false });
        }
      },

      handleRefresh: () => {
        set({ refresh: !get().refresh });
      },
      ProfileUser: async (username) => {
        try {
          set({ isLoadingUser: true });
          const response = await axiosInstance.post(
            `/api/users/profile/${username}`
          );
          set({ User: response.data });
        } catch (error) {
          console.error("Error fetching user:", error);
        } finally {
          set({ isLoadingUser: false });
        }
      },

      login: async (data) => {
        try {
          set({ isLoggingIn: true });
          const response = await axiosInstance.post("/api/admin/login", data);
          set({ authUser: response.data.user });
          toast.success("Login successful");
          if (response.data.accessToken && response.data) {
            localStorage.setItem("token", response.data.accessToken);
          }
        } catch (error) {
          console.error("Error logging in:", error);
          toast.error(
            error.response?.data?.message || "Login failed. Please try again."
          );
        } finally {
          set({ isLoggingIn: false });
        }
      },
    }),
    {
      name: "admin-storage", // unique name
      partialize: (state) => ({
        authUser: state.authUser,
        User: state.User
      }),
    }
  )
);
