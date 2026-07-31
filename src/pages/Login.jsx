import { useState } from "react";
import Navbar from "../components/Navbar.jsx";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access", data.access);
        localStorage.setItem("refresh", data.refresh);
        window.location.href = "/dashboard";
      }
else {
        setMessage(data.error || "Login failed");
      }
    } catch (error) {
      setMessage("Network error");
    }
  };

  return (
    <>
      <Navbar />
      <div className="container mt-5">
        <h2>Login</h2>

      <input
        className="form-control my-2"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        className="form-control my-2"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn btn-primary" onClick={handleLogin}>
        Login
      </button>
      <a href="/register" className="mt-3 d-block">Create an account</a>
      {message && <p className="mt-3">{message}</p>}
    </div>
    </>
    
  );
}
