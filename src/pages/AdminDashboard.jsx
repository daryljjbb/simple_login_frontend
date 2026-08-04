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

  // Redirect non-admins
  if (role !== "admin") {
    return <Navigate to="/dashboard" />;
  }

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to load users");
      }

      const data = await res.json();
      setUsers(data);
      setError("");
    } catch (err) {
      setError("Failed to load users (CORS, auth, or server error)");
    } finally {
      setLoading(false);
    }
  };

  // Update user role
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

      if (!res.ok) {
        throw new Error("Failed to update role");
      }

      await fetchUsers(); // refresh list
    } catch (err) {
      alert("Error updating role");
    }
  };

  // Delete user
  const deleteUser = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const res = await fetch(`${API_URL}/admin/users/${id}/delete/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete user");
      }

      await fetchUsers(); // refresh list
    } catch (err) {
      alert("Error deleting user");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <RequireAuth>
        <layout>
            <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            {loading && <p>Loading users...</p>}
            {error && <p style={{ color: "red" }}>{error}</p>}

            {!loading && users.length === 0 && <p>No users found.</p>}

            {!loading && users.length > 0 && (
                <table className="user-table">
                <thead>
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

                        {/* ROLE DROPDOWN */}
                        <td>
                        <select
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
                            className="delete-btn"
                        >
                            Delete
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            )}
            </div>

        </layout>
        
    </RequireAuth>
    
  );
}

export default AdminDashboard;
