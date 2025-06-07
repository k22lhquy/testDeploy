import ChatContainer from "../../components/messages/ChatContainer";
import NoChatSelected from "../../components/messages/NoChatSelected";
import SideBar from "../../components/messages/SideBar";
import { useChatStore } from "../../store/useChatStore";
import React from "react";

const Message = () => {
  const { selectedUser, onlineUsers } = useChatStore();
  console.log({onlineUsers})
  return (
    <div className="h-screen bg-base-200 w-full">
      <div className="flex items-center justify-center">
        <div className="bg-base-100 rounded-lg shadow-cl p-6 w-full max-w-6xl h-[100vh]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <SideBar />
            {!selectedUser ? <NoChatSelected /> : <ChatContainer />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Message;
