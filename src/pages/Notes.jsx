import { useEffect, useState } from "react";
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

  // drag & drop state
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  async function fetchNotes() {
    const response = await apiFetch(`${import.meta.env.VITE_API_URL}/api/notes/`);
    if (!response.ok) return;

    const data = await response.json();
    // ensure pinned exists (frontend-only)
    const withPinned = data.map((n) => ({
      ...n,
      pinned: n.pinned ?? false,
    }));
    setNotes(withPinned);
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
      // default pinned false on frontend
      newNote.pinned = false;

      setNotes([newNote, ...notes]);
      setTitle("");
      setContent("");
      setCategoryFilter(""); // show all so new note is visible
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

  function togglePin(id) {
    setNotes((prev) =>
      prev.map((note) =>
        note.id === id ? { ...note, pinned: !note.pinned } : note
      )
    );
  }

  function handleDragStart(id) {
    setDraggingId(id);
  }

  function handleDragOver(id) {
    if (!draggingId || draggingId === id) return;

    const updated = [...notes];
    const fromIndex = updated.findIndex((n) => n.id === draggingId);
    const toIndex = updated.findIndex((n) => n.id === id);
    if (fromIndex === -1 || toIndex === -1) return;

    const [moved] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, moved);

    setNotes(updated);
    setDragOverId(id);
  }

  function handleDragEnd() {
    setDraggingId(null);
    setDragOverId(null);
  }

  const filteredNotes = notes
    .filter((note) => {
      const matchesSearch =
        note.title.toLowerCase().includes(search.toLowerCase()) ||
        note.content.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        categoryFilter === "" || note.category === categoryFilter;

      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      // pinned first
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      // then newest first
      return new Date(b.created_at) - new Date(a.created_at);
    });

  return (
    <RequireAuth>
      <div className="container">
        <h2 className="mb-3">My Notes</h2>

        {/* Search */}
        <input
          className="form-control mb-4"
          placeholder="Search notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* Category Filter */}
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

        {/* Notes List */}
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            className={`card p-3 mb-3 shadow-sm ${
              dragOverId === note.id ? "border border-primary" : ""
            }`}
            draggable
            onDragStart={() => handleDragStart(note.id)}
            onDragOver={(e) => {
              e.preventDefault();
              handleDragOver(note.id);
            }}
            onDragEnd={handleDragEnd}
          >
            <div className="d-flex justify-content-between align-items-start">
              <h5 className="mb-1">{note.title}</h5>
              <span style={{ cursor: "grab" }} className="text-muted ms-2">
                ⋮⋮
              </span>
            </div>

            {note.pinned && (
              <span className="badge bg-warning text-dark mb-2">Pinned</span>
            )}

            <div dangerouslySetInnerHTML={{ __html: note.content }} />

            <span
              className={`badge mb-2 ${
                note.category === "work"
                  ? "bg-primary"
                  : note.category === "personal"
                  ? "bg-success"
                  : note.category === "ideas"
                  ? "bg-purple"
                  : note.category === "urgent"
                  ? "bg-danger"
                  : "bg-secondary"
              }`}
            >
              {note.category.charAt(0).toUpperCase() + note.category.slice(1)}
            </span>

            <small className="text-muted d-block mb-2">
              Created: {new Date(note.created_at).toLocaleString()}
            </small>

            <button
              className={`btn btn-sm ${
                note.pinned ? "btn-warning" : "btn-outline-warning"
              } mt-2 me-2`}
              onClick={() => togglePin(note.id)}
            >
              {note.pinned ? "Unpin" : "Pin"}
            </button>

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
