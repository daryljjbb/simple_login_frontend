import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import Layout from "../components/Layout.jsx";
import RequireAuth from "../components/RequireAuth.jsx";

const API_URL = "https://simple-login-backend-f88m.onrender.com/api";

function AdminDashboard() {
  const token = localStorage.getItem("access");
  const role = localStorage.getItem("role");

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [sortColumn, setSortColumn] = useState("username");
  const [sortDirection, setSortDirection] = useState("asc");



  if (role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to load users");

      const data = await res.json();
      setUsers(data);
      setError("");
    } catch (err) {
      setError("Failed to load users (CORS, auth, or server error)");
    } finally {
      setLoading(false);
    }
  };

  const updateRole = async (id, newRole) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${id}/role/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Failed to update role");

      await fetchUsers();
    } catch (err) {
      alert("Error updating role");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_URL}/admin/users/${id}/delete/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Failed to delete user");

      await fetchUsers();
    } catch (err) {
      alert("Error deleting user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const sortUsers = (users) => {
  return [...users].sort((a, b) => {
    let valA = a[sortColumn];
    let valB = b[sortColumn];

    // Convert date to timestamp
    if (sortColumn === "date_joined") {
      valA = new Date(valA).getTime();
      valB = new Date(valB).getTime();
    }

    // Convert null emails to empty string
    if (valA === null) valA = "";
    if (valB === null) valB = "";

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
};


  const filteredUsers = sortUsers(
  users.filter((user) => {
    const term = search.toLowerCase();
    return (
      user.username.toLowerCase().includes(term) ||
      (user.email && user.email.toLowerCase().includes(term)) ||
      user.role.toLowerCase().includes(term)
    );
  })
);

// Analytics
const totalUsers = users.length;
const adminCount = users.filter((u) => u.role === "admin").length;

const today = new Date().toDateString();
const newUsersToday = users.filter(
  (u) => new Date(u.date_joined).toDateString() === today
).length;


const toggleSort = (column) => {
  if (sortColumn === column) {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  } else {
    setSortColumn(column);
    setSortDirection("asc");
  }
};


  return (
    <RequireAuth>
      <Layout>
        <div className="container mt-4">
          <h2 className="mb-4 fw-bold">Admin Dashboard</h2>

          {/* ANALYTICS CARDS */}
            <div className="row mb-4">
            <div className="col-md-4">
                <div className="card shadow-sm border-primary">
                <div className="card-body">
                    <h5 className="card-title text-primary d-flex align-items-center gap-2">
                    <i className="bi bi-people-fill"></i> Total Users
                    </h5>
                    <h3 className="fw-bold">{totalUsers}</h3>
                </div>
                </div>
            </div>

            <div className="col-md-4">
                <div className="card shadow-sm border-danger">
                <div className="card-body">
                    <h5 className="card-title text-danger d-flex align-items-center gap-2">
                    <i className="bi bi-shield-lock-fill"></i> Admin Count
                    </h5>
                    <h3 className="fw-bold">{adminCount}</h3>
                </div>
                </div>
            </div>

            <div className="col-md-4">
                <div className="card shadow-sm border-success">
                <div className="card-body">
                    <h5 className="card-title text-success d-flex align-items-center gap-2">
                    <i className="bi bi-calendar-check-fill"></i> New Users Today
                    </h5>
                    <h3 className="fw-bold">{newUsersToday}</h3>
                </div>
                </div>
            </div>
            </div>


          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fw-bold">Admin Dashboard</h2>

            <input
                type="text"
                className="form-control w-25"
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />
            </div>
          {loading && <p>Loading users...</p>}
          {error && <p className="text-danger">{error}</p>}

          {!loading && users.length === 0 && (
            <p className="text-muted">No users found.</p>
          )}

          {!loading && users.length > 0 && (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle shadow-sm">
                <thead className="table-dark">
                <tr>
                    <th
                    onClick={() => toggleSort("username")}
                    style={{ cursor: "pointer" }}
                    >
                    Username {sortColumn === "username" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>

                    <th
                    onClick={() => toggleSort("email")}
                    style={{ cursor: "pointer" }}
                    >
                    Email {sortColumn === "email" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>

                    <th
                    onClick={() => toggleSort("role")}
                    style={{ cursor: "pointer" }}
                    >
                    Role {sortColumn === "role" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>

                    <th
                    onClick={() => toggleSort("date_joined")}
                    style={{ cursor: "pointer" }}
                    >
                    Date Joined {sortColumn === "date_joined" && (sortDirection === "asc" ? "▲" : "▼")}
                    </th>

                    <th>Actions</th>
                </tr>
                </thead>


                <tbody>
                {filteredUsers.map((user) => (
                    <tr key={user.id}>
                    <td className="fw-semibold">{user.username}</td>
                    <td>{user.email || "—"}</td>

                    <td>
                        {/* ROLE BADGE WITH ICON */}
                        <span
                        className={
                            user.role === "admin"
                            ? "badge bg-danger me-2"
                            : "badge bg-primary me-2"
                        }
                        >
                        {user.role === "admin" ? (
                            <i className="bi bi-shield-lock-fill me-1"></i>
                        ) : (
                            <i className="bi bi-person-fill me-1"></i>
                        )}
                        {user.role}
                        </span>

                        {/* ROLE DROPDOWN */}
                        <select
                        className="form-select form-select-sm d-inline-block w-auto"
                        value={user.role}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                        </select>
                    </td>

                    <td>{new Date(user.date_joined).toLocaleDateString()}</td>

                    <td>
                        <button
                        onClick={() => deleteUser(user.id)}
                        className="btn btn-sm btn-danger d-flex align-items-center gap-1"
                        >
                        <i className="bi bi-trash-fill"></i> Delete
                        </button>
                    </td>
                    </tr>
                ))}
                </tbody>

              </table>
            </div>
          )}
        </div>
      </Layout>
    </RequireAuth>
  );
}

export default AdminDashboard;
