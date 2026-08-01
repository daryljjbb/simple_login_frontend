import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import { refreshAccessToken } from "../utils/auth.js";
import RequireAuth from "../components/RequireAuth.jsx";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [search, setSearch] = useState("");



  async function fetchTasks() {
    let token = localStorage.getItem("access");

    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      token = await refreshAccessToken();
      if (!token) return (window.location.href = "/");
      response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    const data = await response.json();
    setTasks(data);
  }

  useEffect(() => {
    fetchTasks();
  }, []);


 const filteredTasks = tasks.filter(task => {
  const matchesSearch =
    task.title.toLowerCase().includes(search.toLowerCase());

  const matchesStatus =
    statusFilter === "" ||
    (statusFilter === "completed" && task.completed) ||
    (statusFilter === "incomplete" && !task.completed);

  const matchesPriority =
    priorityFilter === "" || task.priority === priorityFilter;

  return matchesSearch && matchesStatus && matchesPriority;
});


  async function handleAddTask() {
    let token = localStorage.getItem("access");

    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title,
        priority,
        due_date: dueDate || null,
        completed: false,
      }),
    });

    if (response.status === 401) {
      token = await refreshAccessToken();
      if (!token) return (window.location.href = "/");
      response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title,
          priority,
          due_date: dueDate || null,
          completed: false,
        }),
      });
    }

    if (response.ok) {
      setTitle("");
      setPriority("medium");
      setDueDate("");
      fetchTasks();
    }
  }

  async function toggleComplete(task) {
    let token = localStorage.getItem("access");

    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${task.id}/`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ completed: !task.completed }),
    });

    if (response.status === 401) {
      token = await refreshAccessToken();
      if (!token) return (window.location.href = "/");
      response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${task.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: !task.completed }),
      });
    }

    if (response.ok) {
      fetchTasks();
    }
  }

  async function handleDeleteTask(id) {
    let token = localStorage.getItem("access");

    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${id}/`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (response.status === 401) {
      token = await refreshAccessToken();
      if (!token) return (window.location.href = "/");
      response = await fetch(`${import.meta.env.VITE_API_URL}/api/tasks/${id}/`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    if (response.ok || response.status === 204) {
      setTasks(tasks.filter((t) => t.id !== id));
    }
  }

  return (
    <>
    <RequireAuth>
        <Layout>

      <div className="container">
        <h2 className="mb-3">My Tasks</h2>
        <input
        className="form-control mb-4"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        />

        <div className="row mb-4">
            <div className="col-md-6">
                <select
                className="form-control"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="incomplete">Incomplete</option>
                </select>
            </div>

            <div className="col-md-6">
                <select
                className="form-control"
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                </select>
            </div>
        </div>
        <div className="card p-4 mb-4 shadow-sm">
          <input
            className="form-control my-2"
            placeholder="Task title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="form-control my-2"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <input
            className="form-control my-2"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <button className="btn btn-primary mt-2" onClick={handleAddTask}>
            Add Task
          </button>
        </div>

        {filteredTasks.map((task) => (
          <div key={task.id} className="card p-3 mb-3 shadow-sm">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <h5 className={task.completed ? "text-muted text-decoration-line-through" : ""}>
                  {task.title}
                </h5>
                <small className="text-muted">
                  Priority: {task.priority.toUpperCase()}
                  {task.due_date && ` • Due: ${task.due_date}`}
                </small>
              </div>

              <div>
                <button
                  className={`btn btn-sm me-2 ${
                    task.completed ? "btn-secondary" : "btn-success"
                  }`}
                  onClick={() => toggleComplete(task)}
                >
                  {task.completed ? "Mark Incomplete" : "Mark Complete"}
                </button>

                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
        </Layout> 

    </RequireAuth>
      
    </>
  );
}
