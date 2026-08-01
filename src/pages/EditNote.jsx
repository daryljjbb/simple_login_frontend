import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { refreshAccessToken } from "../utils/auth.js";

export default function EditNote() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadNote() {
      let token = localStorage.getItem("access");

      let response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}/`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        token = await refreshAccessToken();
        if (!token) return (window.location.href = "/");
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      const data = await response.json();
      setTitle(data.title);
      setContent(data.content);
    }

    loadNote();
  }, [id]);

  async function handleUpdate() {
    let token = localStorage.getItem("access");

    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    if (response.status === 401) {
      token = await refreshAccessToken();
      if (!token) return (window.location.href = "/");
      response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
    }

    if (response.ok) {
      setMessage("Note updated successfully");
    }
  }

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <h2>Edit Note</h2>

        <div className="card p-4 shadow-sm">
          <input
            className="form-control my-2"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="form-control my-2"
            rows={4}
            placeholder="Note content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button className="btn btn-primary mt-3" onClick={handleUpdate}>
            Save Changes
          </button>

          {message && <p className="mt-3 text-success">{message}</p>}
        </div>
      </div>
    </>
  );
}
