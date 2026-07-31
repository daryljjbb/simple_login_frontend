import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";


export default function Dashboard() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
      window.location.href = "/";
      return;
    }

    fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => {
        if (res.status === 401) {
          window.location.href = "/";
        }
        return res.json();
      })
      .then(data => setMessage(data.message))
      .catch(() => setMessage("Unauthorized"));
  }, []);

  return (
  <>
    <Navbar />

    <div className="container mt-5">
      <h2>Dashboard</h2>
      <p>{message}</p>
    </div>
  </>
);

}
