import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import { refreshAccessToken } from "../utils/auth.js";
import ReactQuill from "react-quill";


export default function EditNote() {
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState("other");


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
      setCategory(data.category);
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
      body: JSON.stringify({ title, content, category }),
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
        body: JSON.stringify({ title, content, category }),
      });
    }

    if (response.ok) {
      setMessage("Note updated successfully");
    }
  }

  return (
    <>
      <Layout >

      <div className="container ">
        <h2>Edit Note</h2>

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
        <div className="card p-4 shadow-sm">
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
            placeholder="Edit your note..."
          />


          <button className="btn btn-primary mt-3" onClick={handleUpdate}>
            Save Changes
          </button>

          {message && <p className="mt-3 text-success">{message}</p>}
        </div>
      </div>
    </Layout>
    </>
  );
}
