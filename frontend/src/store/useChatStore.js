import { create } from "zustand";
import { persist } from "zustand/middleware";
import toast from "react-hot-toast";
import axiosInstance from "../apis/axiosInstance";
import { io } from "socket.io-client";

// const BARE_URL = "http://localhost:5000";
const BARE_URL = "https://xx-m8te.onrender.com";

export const useChatStore = create(
  persist(
    (set, get) => ({
      authUser: null,
      messages: [],
      users: [],
      selectedUser: null,
      isUsersLoading: false,
      isMessagesLoading: false,
      onlineUsers: [],
      isLoggingIn: false,
      isCheckingAuth: true,
      socket: null,
      userSuggested: [],
      isLoadingUserSuggested: false,
      POSTS: [],
      isLoadingPOST: true,
      usersSearch: [],
      refreshPosts: false,

      // handleDeletePost : async (postId) => {
      //   const response = await axiosInstance.delete(`/api/posts/${postId}`);
      //   if (response.status === 200) {
      //     onDelete();
      //     console.log("Post deleted successfully");
      //   } else {
      //     console.error("Error deleting post");
      //   }
      // },
      newPasswordAPI: async (email, password) => {
        try {
          const response = await axiosInstance.post("/api/auth/newPassword", {
            email,
            password,
          });
          toast.success("Password reset successfully");
          return response.data;
        } catch (error) {
          console.error("Error resetting password:", error);
        }
      },

      forgotPassword: async (email) => {
        try {
          const response = await axiosInstance.post(
            "/api/auth/forgotPassword",
            { email }
          );
          toast.success("OTP sent to your email");
          return response.data;
        } catch (error) {
          console.error("Error sending OTP:", error);
          toast.error(error.response?.data?.message || "Failed to send OTP");
        }
      },

      reportComments: async (reason, commentId) => {
        try {
          const res = await axiosInstance.post(
            `/api/posts/report/comment/${commentId}`,
            { reason }
          );
          toast.success("report success!");
        } catch (error) {
          console.error("Error blocking user:", error);
        }
      },

      reportPost: async (reason, postId) => {
        try {
          const res = await axiosInstance.post(
            `/api/posts/report/post/${postId}`,
            { reason }
          );
          toast.success("report success!");
        } catch (error) {
          console.error("Error blocking user:", error);
        }
      },

      editCommentStore: async (newText, commentId) => {
        try {
          const res = await axiosInstance.put(
            `/api/posts/editComment/${commentId}`,
            {
              text: newText,
            }
          );
          toast.success("Edit success!");
        } catch (error) {
          console.error(
            "Error editing comment:",
            error.response?.data || error.message
          );
          toast.error("Failed to edit comment");
        }
      },

      changeRefreshPosts: () => {
        set((state) => ({ refreshPosts: !state.refreshPosts }));
      },

      changePassword: async (data) => {
        try {
          const response = await axiosInstance.post(
            "/api/users/changPassword",
            data
          );
          set({ authUser: response.data.user });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.error("Error updating profile:", error);
          toast.error(error.response.data.message);
        }
      },

      editProfile: async (data) => {
        try {
          const response = await axiosInstance.post("/api/users/update", data);
          set({ authUser: response.data.user });
          toast.success("Profile updated successfully");
        } catch (error) {
          console.error("Error updating profile:", error);
          toast.error(error.response.data.message);
        }
      },

      searchPosts: async (search) => {
        try {
          set({ isLoadingPOST: true });
          const response = await axiosInstance.get(
            `/api/search/posts?search=${search}`
          );
          console.log("response", response.data.posts);
          set({ POSTS: response.data.posts });
        } catch (error) {
          console.error("Error searching posts:", error);
        } finally {
          set({ isLoadingPOST: false });
        }
      },

      searchUsers: async (search) => {
        try {
          set({ isUsersLoading: true });
          const response = await axiosInstance.get(
            `/api/search/users?search=${search}`
          );
          console.log("response", response.data.users);
          set({ usersSearch: response.data.users });
        } catch (error) {
          console.error("Error searching posts:", error);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      fetchPosts: async (POST_ENDPOINT) => {
        // const POST_ENDPOINT = getPostEndPoint();
        try {
          set({ isLoadingPOST: true });
          const response = await axiosInstance.get(POST_ENDPOINT);
          set({ POSTS: response.data.posts });
          // setPosts(response.data);
        } catch (error) {
          console.error("Error fetching posts:", error);
        } finally {
          // setIsLoading(false);
          set({ isLoadingPOST: false });
        }
      },

      handleFollow: async (userId) => {
        try {
          const response = await axiosInstance.post(
            `/api/users/follow/${userId}`
          );
        } catch (error) {
          console.error("Error following user:", error);
        }
      },

      suggested: async () => {
        try {
          set({ isLoadingUserSuggested: true });
          const response = await axiosInstance("/api/users/suggested"); // Adjust the endpoint as needed
          set({ userSuggested: response.data });
        } catch (error) {
          console.error("Error fetching users:", error);
        } finally {
          set({ isLoadingUserSuggested: false });
        }
      },

      checkAuth: async () => {
        try {
          const res = await axiosInstance.post("/api/auth/me");
          set({ authUser: res.data });
          get().connectSocket();
        } catch (error) {
          console.log("Error in checkAuth:", error);
          set({ authUser: null });
        } finally {
          set({ isCheckingAuth: false });
        }
      },

      login: async (data) => {
        set({ isLoggingIn: true });
        try {
          const res = await axiosInstance.post("/api/auth/login", data);
          set({ authUser: res.data.user });
          console.log("Login response:", res.data.user);
          toast.success("Logged in successfully");
          if (res.data.accessToken && res.data) {
            localStorage.setItem("token", res.data.accessToken);
          }
          get().connectSocket();
        } catch (error) {
          toast.error(error.response.data.message);
          throw error;
        } finally {
          set({ isLoggingIn: false });
          console.log("authUser", get().authUser);
        }
      },

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const response = await axiosInstance.get("/api/messages/users");
          set({ users: response.data });
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
          const response = await axiosInstance.get(`/api/messages/${userId}`);
          set({ messages: response.data });
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
          const response = await axiosInstance.post(
            `/api/messages/send/${selectedUser._id}`,
            messageData
          );
          set({ messages: [...messages, response.data] });
          get().getUsers();
        } catch (error) {
          toast.error(error.response.data.message);
        }
      },

      setSelectedUser: (user) => set({ selectedUser: user }),

      connectSocket: () => {
        const authUser = get().authUser;
        if (!authUser || get().socket?.connected) return;
        const socket = io(BARE_URL, {
          query: {
            userId: authUser._id,
          },
        });
        socket.connect();
        set({ socket });
        socket.on("getOnlineUsers", (userIds) => {
          set({ onlineUsers: userIds });
        });
      },
      disconnectSocket: () => {
        if (get().socket?.connected) {
          get().socket.disconnect();
        }
      },
      subscribeToMessages: () => {
        const { selectedUser, socket } = get();
        if (!socket) {
          console.warn("Socket chưa sẵn sàng khi gọi subscribeToMessages");
          return;
        }
        if (!selectedUser) {
          console.warn("Chưa có selectedUser khi gọi subscribeToMessages");
          return;
        }
        socket.on("newMessage", (newMessage) => {
          if (newMessage.senderId !== selectedUser._id) return;
          set({ messages: [...get().messages, newMessage] });
        });
      },
      unsubscribeFromMessages: () => {
        const { socket } = get();
        if (socket) {
          socket.off("newMessage");
        }
      },
    }),
    {
      name: "auth-storage", // name of the item in the storage (must be unique)
      partialize: (state) => ({
        authUser: state.authUser,
        // selectedUser: state.selectedUser,
        messages: state.messages,
        // onlineUsers: state.onlineUsers,
      }), // only persist authUser and socket
    }
  )
);
