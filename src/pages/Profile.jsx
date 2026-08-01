import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { refreshAccessToken } from "../utils/auth.js";
import RequireAuth from "../components/RequireAuth.jsx";

export default function Profile() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    async function loadProfile() {
      let token = localStorage.getItem("access");

      if (!token) {
        window.location.href = "/";
        return;
      }

      let response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Auto-refresh if expired
      if (response.status === 401) {
        token = await refreshAccessToken();

        if (!token) {
          window.location.href = "/";
          return;
        }

        response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const data = await response.json();
      setProfile(data);
    }

    loadProfile();
  }, []);

  if (!profile) return null;

  return (
    <>
    <RequireAuth>
         <Layout>

      <div className="container">
        <h2 className="mb-3">User Profile</h2>

        <div className="card p-4 shadow-sm">
          <h4>{profile.username}</h4>

          <p><strong>Email:</strong> {profile.email || "No email set"}</p>
          <p><strong>Date Joined:</strong> {new Date(profile.date_joined).toLocaleString()}</p>
          <p><strong>Last Login:</strong> {profile.last_login ? new Date(profile.last_login).toLocaleString() : "Never"}</p>
        </div>
      </div>
        </Layout>

    </RequireAuth>
     
    </>
  );
}
