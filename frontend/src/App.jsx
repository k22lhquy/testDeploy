import React, { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/home/HomePage";
import LoginPage from "./pages/auth/login/LoginPage";
import SignUpPage from "./pages/auth/signup/SignUpPage";
import Sidebar from "./components/common/Sidebar";
import RightPanel from "./components/common/RightPanel";
import NotificationPage from "./pages/notification/NotificationPage";
import ProfilePage from "./pages/profile/ProfilePage";
import { Toaster } from "react-hot-toast";
import Message from "./pages/message/Message";
import { useChatStore } from "./store/useChatStore";
import Search from "./pages/search/Search";
import OAuthSuccess from "./pages/auth/loginWithGG/OAuthSuccess";
import LoginAdmin from "./pages/admin/login/LoginAdmin";
import SidebarAdmin from "./pages/admin/sidebar/SidebarAdmin";
import UsersAdmin from "./pages/admin/users/UsersAdmin";
import PostsAdmin from "./pages/admin/posts/PostsAdmin";
import ProfileAdmin from "./pages/admin/profile/ProfileAdmin";
import NotificationsAdmin from "./pages/admin/notifications/NotificationsAdmin";
import Dashboard from "./pages/admin/dashboard/Dashboard";
import PostHiddenAdmin from "./pages/admin/posts/PostHiddenAdmin";
import PostReportAdmin from "./pages/admin/posts/PostReportAdmin";
import ForgotPassword from "./pages/auth/forgotPassword/ForgotPassword";

function App() {
  // const isLogin = !!localStorage.getItem("token");
  const location = useLocation();
  const adminPage = location.pathname.startsWith("/admin");

  // Các đường dẫn không cần hiển thị Sidebar và RightPanel
  const hideSidebarPaths = ["/login", "/signup", "/forgotPassword", "/admin/login"];
  const shouldHideSidebar = hideSidebarPaths.includes(location.pathname);
  
  const PrivateRoute = ({ children }) => {
    const isLogin = !!localStorage.getItem("token");
    return isLogin ? children : <Navigate to="/login" />;
  };

  return (
    <>
      {!adminPage ? <div className="flex min-h-screen px-4">
        {!shouldHideSidebar && <Sidebar />}
        <div className="flex-1 max-w-[1000px] mx-auto">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/forgotPassword" element={<ForgotPassword />} />

            {/* Các route cần đăng nhập */}
            <Route path="/" element={<Root />} />
            <Route
              path="/home"
              element={
                <PrivateRoute>
                  <HomePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/message"
              element={
                <PrivateRoute>
                  <Message />
                </PrivateRoute>
              }
            />
            <Route path="/oauth-success" element={<OAuthSuccess />} />
            <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <NotificationPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/profile/:username"
              element={
                <PrivateRoute>
                  <ProfilePage />
                </PrivateRoute>
              }
            />
            <Route
              path="/search"
              element={
                <PrivateRoute>
                  <Search />
                </PrivateRoute>
              }
            />
          </Routes>
          <Toaster />
        </div>
        {!shouldHideSidebar && <RightPanel />}
      </div> :
      <div className="flex min-h-screen px-4">
        {!shouldHideSidebar && <SidebarAdmin />}
        <div className="flex-1 max-w-[1000px] mx-auto">
          <Routes>
            <Route path="/admin/login" element={<LoginAdmin />} />
            <Route
              path="/admin/home"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <PrivateRoute>
                  <UsersAdmin />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/notifications"
              element={
                <PrivateRoute>
                  <NotificationsAdmin />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/posts"
              element={
                <PrivateRoute>
                  <PostsAdmin />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/postsIsHidden"
              element={
                <PrivateRoute>
                  <PostHiddenAdmin />
                </PrivateRoute>
              }
            />
            <Route
              path="/admin/PostReportAdmin"
              element={
                <PrivateRoute>
                  <PostReportAdmin />
                </PrivateRoute>
              }
            />

            <Route
              path="admin/profile/:username"
              element={
                <PrivateRoute>
                  <ProfileAdmin/>
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </div>}
    </>
  );
}

const Root = () => {
  const isLogin = !!localStorage.getItem("token");
  return <Navigate to={isLogin ? "/home" : "/login"} />;
};

export default App;
