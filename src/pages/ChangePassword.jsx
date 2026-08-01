import { useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { refreshAccessToken } from "../utils/auth.js";

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = async () => {
    let token = localStorage.getItem("access");

    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/change-password/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
    });

    if (response.status === 401) {
      token = await refreshAccessToken();
      if (!token) return (window.location.href = "/");
    }

    const data = await response.json();
    setMessage(data.message || data.error);
  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <h2>Change Password</h2>

        <div className="card p-4 shadow-sm">
          <input
            className="form-control my-2"
            type="password"
            placeholder="Old Password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <input
            className="form-control my-2"
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <button className="btn btn-warning mt-3" onClick={handleChange}>
            Update Password
          </button>

          {message && <p className="mt-3">{message}</p>}
        </div>
      </div>
    </>
  );
}
