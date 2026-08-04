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

  return (
    <RequireAuth>
      <Layout>
        <div className="container mt-4">
          <h2 className="mb-4">Admin Dashboard</h2>

          {loading && <p>Loading users...</p>}
          {error && <p className="text-danger">{error}</p>}

          {!loading && users.length === 0 && (
            <p className="text-muted">No users found.</p>
          )}

          {!loading && users.length > 0 && (
            <div className="table-responsive">
              <table className="table table-striped table-hover align-middle">
                <thead className="table-dark">
                  <tr>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Date Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.username}</td>
                      <td>{user.email || "—"}</td>

                      <td>
                        <select
                          className="form-select form-select-sm"
                          value={user.role}
                          onChange={(e) =>
                            updateRole(user.id, e.target.value)
                          }
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>

                      <td>{new Date(user.date_joined).toLocaleDateString()}</td>

                      <td>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="btn btn-sm btn-danger"
                        >
                          Delete
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
