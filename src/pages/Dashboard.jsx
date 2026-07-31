import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { refreshAccessToken } from "../utils/auth.js";

export default function Dashboard() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      let token = localStorage.getItem("access");

      if (!token) {
        window.location.href = "/";
        return;
      }

      let response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // If token expired, try refreshing
      if (response.status === 401) {
        token = await refreshAccessToken();

        if (!token) {
          window.location.href = "/";
          return;
        }

        // Retry request with new token
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const data = await response.json();
      setMessage(data.message);
    }

    loadDashboard();
  }, []);

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <h2 className="mb-3">Dashboard</h2>

        <div className="card p-4 shadow-sm">
          <h4>{message}</h4>
          <p className="text-muted">You are successfully logged in with JWT authentication.</p>
        </div>
      </div>
    </>
  );
}
