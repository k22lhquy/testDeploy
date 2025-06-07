import { useState } from "react";
import { useChatStore } from "../../store/useChatStore";
import toast from "react-hot-toast";

const EditProfileModal = ({ handleRefresh }) => {
  const { editProfile, changePassword } = useChatStore();

  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    bio: "",
    link: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = async () => {
    await editProfile(formData);
    setFormData({
      fullname: "",
      username: "",
      email: "",
      bio: "",
      link: "",
    });
	handleRefresh();
	document.getElementById("edit_profile_modal").close();
  };

  const handlePasswordSubmit = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("update false!");
      return;
    }
    try {
      await changePassword(passwordData);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      document.getElementById("edit_password_modal").close();
    } catch (err) {
      toast.error("update false!");
      console.error(err);
    }
	handleRefresh();
  };

  return (
    <>
      {/* Nút Edit Profile */}
      <button
        className="btn btn-outline rounded-full btn-sm mr-2"
        onClick={() =>
          document.getElementById("edit_profile_modal").showModal()
        }
      >
        Edit profile
      </button>

      {/* Nút Edit Password */}
      <button
        className="btn btn-outline rounded-full btn-sm"
        onClick={() =>
          document.getElementById("edit_password_modal").showModal()
        }
      >
        Edit password
      </button>

      {/* Modal Edit Profile */}
      <dialog id="edit_profile_modal" className="modal">
        <div className="modal-box border rounded-md border-gray-700 shadow-md">
          <h3 className="font-bold text-lg my-3">Update Profile</h3>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleFormSubmit();
            }}
          >
            <div className="flex flex-wrap gap-2">
              <input
                type="text"
                placeholder="Full Name"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.fullname}
                name="fullname"
                onChange={handleInputChange}
              />
              <input
                type="text"
                placeholder="Username"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.username}
                name="username"
                onChange={handleInputChange}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <input
                type="email"
                placeholder="Email"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.email}
                name="email"
                onChange={handleInputChange}
              />
              <textarea
                placeholder="Bio"
                className="flex-1 input border border-gray-700 rounded p-2 input-md"
                value={formData.bio}
                name="bio"
                onChange={handleInputChange}
              />
            </div>
            <input
              type="text"
              placeholder="Link"
              className="flex-1 input border border-gray-700 rounded p-2 input-md w-full"
              value={formData.link}
              name="link"
              onChange={handleInputChange}
            />
            <button
              className="btn btn-primary rounded-full btn-sm text-white"
              onClick={handleRefresh}
            >
              Update
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>

      {/* Modal Đổi mật khẩu */}
      <dialog id="edit_password_modal" className="modal">
        <div className="modal-box bg-gray-800 text-white border border-gray-600 rounded-xl shadow-lg">
          <h3 className="font-bold text-xl mb-6 text-center">
            Change Password
          </h3>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handlePasswordSubmit(); // Tự định nghĩa
            }}
          >
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              className="input input-bordered w-full bg-gray-900 text-white border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              className="input input-bordered w-full bg-gray-900 text-white border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="input input-bordered w-full bg-gray-900 text-white border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
            />

            <button className="btn bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 rounded-full mt-4">
              Save Change
            </button>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button className="outline-none">close</button>
        </form>
      </dialog>
    </>
  );
};

export default EditProfileModal;
