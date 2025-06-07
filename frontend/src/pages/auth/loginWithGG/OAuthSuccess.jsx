// pages/OAuthSuccess.jsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../../../store/useChatStore";
import toast from "react-hot-toast";

const OAuthSuccess = () => {
  // alert("Đang xử lý đăng nhập bằng Google...");
  const navigate = useNavigate();
  const { checkAuth } = useChatStore();

  useEffect(() => {
    const fetchData = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      console.log("Token from URL:", token);

      if (token) {
        localStorage.setItem("token", token);
        await checkAuth();
        navigate("/home");
      }
    };
    fetchData();
  }, []);

  return (
    <div className="text-white text-center mt-10">Đang xử lý đăng nhập...</div>
  );
};

export default OAuthSuccess;
