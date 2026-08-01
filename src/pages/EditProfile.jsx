import { useState } from "react";
import Layout from "../components/Layout.jsx";
import { refreshAccessToken } from "../utils/auth.js";

export default function EditProfile() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState("");

  const handleUpdate = async () => {
    let token = localStorage.getItem("access");

    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/update/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email, username }),
    });

    if (response.status === 401) {
      token = await refreshAccessToken();
      if (!token) return (window.location.href = "/");
    }

    const data = await response.json();
    setMessage(data.message);
  };

  return (
    <>
      <Layout >

      <div className="container">
        <h2>Edit Profile</h2>

        <div className="card p-4 shadow-sm">
          <input
            className="form-control my-2"
            placeholder="New Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="form-control my-2"
            placeholder="New Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <button className="btn btn-primary mt-3" onClick={handleUpdate}>
            Save Changes
          </button>

          {message && <p className="mt-3">{message}</p>}
        </div>
      </div>
        </Layout>
    </>
  );
}
