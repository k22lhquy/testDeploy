import React, { useState } from 'react'
import XSvg from '../../../components/svgs/X';
import { MdOutlineMail, MdPassword } from 'react-icons/md';
import { Link, useNavigate } from 'react-router-dom';
import { useAdminStore } from '../../../store/useAdmin';

const LoginAdmin = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const { login } = useAdminStore();

  const [error, setError] = useState("");

  const handleSubmit = async () => {
    event.preventDefault();
    setError("");
    if (!formData.username || !formData.password) {
      setError("Please fill in all fields");
      return;
    }
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    await login(formData);
    navigate("/admin/home");

  }

  const handleInputChange = () => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  }
  return (
    <div className="max-w-screen-xl mx-auto  flex h-screen px-10">
      <div className="flex-1 hidden lg:flex items-center  justify-center">
        <XSvg className="lg:w-2/3 fill-white" />
      </div>
      <div className="flex-1 flex flex-col justify-center items-center">
        <form
          className="lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col"
          onSubmit={handleSubmit}
        >
          <XSvg className="w-24 lg:hidden fill-white" />
          <h1 className="text-4xl font-extrabold text-white">{"Let's"} Admin go.</h1>
          <label className="input input-bordered rounded flex items-center gap-2">
            <MdOutlineMail />
            <input
              type="text"
              className="grow"
              placeholder="username"
              name="username"
              onChange={handleInputChange}
              value={formData.username}
            />
          </label>

          <label className="input input-bordered rounded flex items-center gap-2">
            <MdPassword />
            <input
              type="password"
              className="grow"
              placeholder="Password"
              name="password"
              onChange={handleInputChange}
              value={formData.password}
            />
          </label>
          <button className="btn rounded-full btn-primary text-white">
            Login
          </button>
          {error && <p className="text-red-500">{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default LoginAdmin
