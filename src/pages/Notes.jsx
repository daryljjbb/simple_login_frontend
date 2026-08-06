import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import RequireAuth from "../components/RequireAuth.jsx";
import ReactQuill from "react-quill";
import { apiFetch } from "../utils/api";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("other");
  const [categoryFilter, setCategoryFilter] = useState("");

  async function fetchNotes() {
    const response = await apiFetch(`${import.meta.env.VITE_API_URL}/api/notes/`);
    if (!response.ok) return;

    const data = await response.json();
    setNotes(data);
  }

  useEffect(() => {
    fetchNotes();
  }, []);

 async function handleAddNote() {
  const response = await apiFetch(`${import.meta.env.VITE_API_URL}/api/notes/`, {
    method: "POST",
    body: JSON.stringify({ title, content, category }),
  });

 if (response.ok) {
  const newNote = await response.json();
  setNotes([newNote, ...notes]);
    await fetchNotes();     // refresh notes list
  }
}


  async function handleDeleteNote(id) {
    const response = await apiFetch(`${import.meta.env.VITE_API_URL}/api/notes/${id}/`, {
      method: "DELETE",
    });

    if (response.ok || response.status === 204) {
      setNotes(notes.filter((note) => note.id !== id));
    }
  }

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      note.title.toLowerCase().includes(search.toLowerCase()) ||
      note.content.toLowerCase().includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "" || note.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <RequireAuth>
        <div className="container">
          <h2 className="mb-3">My Notes</h2>

          <input
            className="form-control mb-4"
            placeholder="Search notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="form-control mb-4"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="ideas">Ideas</option>
            <option value="urgent">Urgent</option>
            <option value="other">Other</option>
          </select>

          {/* Add Note Form */}
          <div className="card p-4 mb-4 shadow-sm">
            <input
              className="form-control my-2"
              placeholder="Note title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              className="my-2"
              placeholder="Write your note here..."
            />

            <select
              className="form-control my-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
              <option value="ideas">Ideas</option>
              <option value="urgent">Urgent</option>
              <option value="other">Other</option>
            </select>

            <button className="btn btn-primary mt-2" onClick={handleAddNote}>
              Add Note
            </button>
          </div>

          {/* Filtered Notes */}
          {filteredNotes.map((note) => (
            <div key={note.id} className="card p-3 mb-3 shadow-sm">
              <h5>{note.title}</h5>

              <div dangerouslySetInnerHTML={{ __html: note.content }} />

              <span className="badge bg-primary mb-2">
                {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
              </span>

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
    </RequireAuth>
  );
}
