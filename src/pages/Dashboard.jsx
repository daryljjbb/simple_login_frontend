import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { refreshAccessToken } from "../utils/auth.js";
import RequireAuth from "../components/RequireAuth.jsx";


export default function Dashboard() {
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);

  async function fetchWithAuth(path) {
    let token = localStorage.getItem("access");

    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      token = await refreshAccessToken();
      if (!token) return (window.location.href = "/");
      response = await fetch(`${import.meta.env.VITE_API_URL}/api/${path}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    return response.json();
  }

  useEffect(() => {
    async function loadData() {
      const notesData = await fetchWithAuth("notes/");
      const tasksData = await fetchWithAuth("tasks/");
      setNotes(notesData);
      setTasks(tasksData);
    }
    loadData();
  }, []);

  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalTasks = tasks.length;
  const recentNotes = notes.slice(0, 3);
  const recentTasks = tasks.slice(0, 3);

  return (
    <>
    <RequireAuth>
      <Layout>

      <div className="container">
        <h2 className="mb-4">Dashboard</h2>

        {/* Summary cards */}
        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <h5>Total Notes</h5>
              <h3>{notes.length}</h3>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <h5>Total Tasks</h5>
              <h3>{totalTasks}</h3>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card p-3 shadow-sm">
              <h5>Completed Tasks</h5>
              <h3>{completedTasks}</h3>
            </div>
          </div>
        </div>

        {/* Recent Notes + Tasks */}
        <div className="row">
          <div className="col-md-6">
            <div className="card p-3 shadow-sm mb-4">
              <h4>Recent Notes</h4>
              {recentNotes.length === 0 && <p className="text-muted">No notes yet.</p>}
              {recentNotes.map((note) => (
                <div key={note.id} className="mb-3">
                  <strong>{note.title}</strong>
                  <div
                    className="small text-muted"
                    dangerouslySetInnerHTML={{ __html: note.content }}
                  />
                </div>
              ))}
              <a href="/notes" className="btn btn-sm btn-outline-primary">
                View all notes
              </a>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card p-3 shadow-sm mb-4">
              <h4>Recent Tasks</h4>
              {recentTasks.length === 0 && <p className="text-muted">No tasks yet.</p>}
              {recentTasks.map((task) => (
                <div key={task.id} className="mb-2">
                  <strong>{task.title}</strong>
                  <div className="small text-muted">
                    Priority: {task.priority.toUpperCase()}
                    {task.due_date && ` • Due: ${task.due_date}`}
                    {task.completed && " • Completed"}
                  </div>
                </div>
              ))}
              <a href="/tasks" className="btn btn-sm btn-outline-primary">
                View all tasks
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
    </RequireAuth>
    </>
  );
}
