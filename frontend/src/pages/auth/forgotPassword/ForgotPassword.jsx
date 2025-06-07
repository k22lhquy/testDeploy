import React, { useState } from "react";
import toast from "react-hot-toast";
import { useChatStore } from "../../../store/useChatStore";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpEmail, setOtpEmail] = useState("");
  const [isOtpValid, setIsOtpValid] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { forgotPassword, newPasswordAPI } = useChatStore();
  const navigate = useNavigate();

  const handleSendOTP = async (email) => {
    if (!email) {
      toast.error("Vui lòng nhập email!");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Email không hợp lệ!");
      return;
    }

    const response = await forgotPassword(email);
    if (!response || !response.otp) {
      toast.error("Gửi mã OTP thất bại. Vui lòng thử lại sau.");
      return;
    }
    if (response.status === 404) {
      toast.error(response.message);
      return;
    }

    setOtpEmail(response.otp);
    setShowOtp(true);
    toast.success("Đã gửi mã OTP tới email!");
  };

  const handleNewPasswordChange = async () => {
    await newPasswordAPI(email, newPassword);
    toast.success("Mật khẩu đã được đặt lại thành công!");
    navigate("/login");
  };

  const handleOtpChange = (e) => {
    const newOtp = e.target.value;
    setOtp(newOtp);
    if (newOtp.length === 6 && newOtp === otpEmail) {
      toast.success("Mã OTP hợp lệ!");
      setIsOtpValid(true);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-base-100 shadow-lg rounded-lg space-y-4">
      <h2 className="text-2xl font-bold text-center">Quên mật khẩu</h2>

      {/* Nhập email */}
      <div>
        <label className="label">
          <span className="label-text">Email</span>
        </label>
        <input
          type="email"
          placeholder="example@gmail.com"
          className="input input-bordered w-full"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <button
        className="btn btn-primary w-full"
        onClick={() => handleSendOTP(email)}
      >
        Gửi mã tới Gmail
      </button>

      {showOtp && (
        <div>
          <label className="label">
            <span className="label-text">Mã OTP</span>
          </label>
          <input
            type="text"
            placeholder="Nhập mã OTP"
            maxLength={6}
            className="input input-bordered w-full text-center tracking-widest"
            value={otp}
            onChange={handleOtpChange}
          />
        </div>
      )}

      {/* Nhập mật khẩu mới nếu OTP đúng */}
      {isOtpValid && (
        <>
          <div>
            <label className="label">
              <span className="label-text">Mật khẩu mới</span>
            </label>
            <input
              type="password"
              placeholder="Nhập mật khẩu mới"
              className="input input-bordered w-full"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text">Xác nhận mật khẩu</span>
            </label>
            <input
              type="password"
              placeholder="Nhập lại mật khẩu"
              className="input input-bordered w-full"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          <button
            className="btn btn-success w-full mt-2"
            onClick={() => {
              if (!newPassword || !confirmPassword) {
                toast.error("Vui lòng nhập đầy đủ mật khẩu mới!");
                return;
              }
              if (newPassword.length < 6) {
                toast.error("Mật khẩu mới phải có ít nhất 6 ký tự!");
                return;
              }
              if (newPassword !== confirmPassword) {
                toast.error("Mật khẩu không khớp!");
              } else {
                handleNewPasswordChange();
              }
            }}
          >
            Đặt lại mật khẩu
          </button>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
