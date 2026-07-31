import { useEffect, useState } from "react";

export default function Dashboard() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("access");

    fetch(`${import.meta.env.VITE_API_URL}/api/dashboard/`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(res => res.json())
      .then(data => setMessage(data.message))
      .catch(() => setMessage("Unauthorized"));
  }, []);

  return (
    <div className="container mt-5">
      <h2>Dashboard</h2>
      <p>{message}</p>
    </div>
  );
}
