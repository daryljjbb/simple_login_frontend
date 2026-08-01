import { useEffect, useState } from "react";
import Navbar from "../components/Navbar.jsx";
import { refreshAccessToken } from "../utils/auth.js";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  async function fetchNotes() {
    let token = localStorage.getItem("access");

    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      token = await refreshAccessToken();
      if (!token) return (window.location.href = "/");
      response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    const data = await response.json();
    setNotes(data);
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  async function handleAddNote() {
    let token = localStorage.getItem("access");

    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    });

    if (response.status === 401) {
      token = await refreshAccessToken();
      if (!token) return (window.location.href = "/");
      response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });
    }

    if (response.ok) {
      setTitle("");
      setContent("");
      fetchNotes();
    }
  }

  async function handleDeleteNote(id) {
    let token = localStorage.getItem("access");

    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      token = await refreshAccessToken();
      if (!token) return (window.location.href = "/");
      response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    if (response.ok || response.status === 204) {
      setNotes(notes.filter((note) => note.id !== id));
    }
  }

  return (
    <>
      <Navbar />

      <div className="container mt-5">
        <h2 className="mb-3">My Notes</h2>

        <div className="card p-4 mb-4 shadow-sm">
          <input
            className="form-control my-2"
            placeholder="Note title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="form-control my-2"
            placeholder="Note content"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <button className="btn btn-primary mt-2" onClick={handleAddNote}>
            Add Note
          </button>
        </div>

        {notes.map((note) => (
          <div key={note.id} className="card p-3 mb-3 shadow-sm">
            <h5>{note.title}</h5>
            <p>{note.content}</p>
            <small className="text-muted">
              Created: {new Date(note.created_at).toLocaleString()}
            </small>
            <a
            href={`/notes/${note.id}/edit`}
            className="btn btn-sm btn-secondary mt-2 me-2"
            >
            Edit
            </a>
            <button
              className="btn btn-sm btn-danger mt-2"
              onClick={() => handleDeleteNote(note.id)}
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
