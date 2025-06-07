import React, { use, useEffect, useRef, useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import ChatHeader from "../skeletons/ChatHeader";
import MessageInput from "../skeletons/MessageInput";
import MessageSkeleton from "./MessageSkeleton";
import { formatMessageTime } from "../../utils/date";
import axiosInstance from "../../apis/axiosInstance";

const ChatContainer = () => {
  const { messages, getMessages, selectedUser, isMessagesLoading, subscribeToMessages, unsubscribeFromMessages, authUser, socket, connectSocket } =
    useChatStore();
    const messageEndRef = useRef(null);
    useEffect(() => {
      if (authUser) {
        connectSocket(); // tự kết nối lại khi người dùng còn đăng nhập
      }
    }, [authUser]);

    useEffect(() => {
      console.log("Selected user:", selectedUser);
      console.log("Socket:", socket);
      // if (selectedUser && socket) {
      if (selectedUser && socket) {
        getMessages(selectedUser._id);
        subscribeToMessages();
      }
      return () => {
        if (socket) unsubscribeFromMessages();
      };
    }, [selectedUser, socket]);
    useEffect(() => {
      if (messageEndRef.current && messages) {
        messageEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    }, [messages]);

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
          >
            <div className=" chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profileImg || "/avatar-placeholder.png"
                      : selectedUser.profileImg || "/avatar-placeholder.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>
            <div className="chat-bubble flex flex-col">
              {message.image && (
                <img
                  src={message.image}
                  alt="Attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && <p>{message.text}</p>}
            </div>
          </div>
        ))}
      </div>
      <MessageInput />
    </div>
  );
};

export default ChatContainer;
