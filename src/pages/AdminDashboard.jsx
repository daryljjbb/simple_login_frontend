import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import RequireAuth from "../components/RequireAuth.jsx";
import RequireRole from "../components/RequireRole.jsx";
import { apiFetch } from "../utils/api";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError("");

    try {
      const res = await apiFetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/`
      );

      if (!res.ok) {
        setError("Failed to load users (CORS, auth, or server error).");
        setUsers([]);
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!Array.isArray(data)) {
        setError("Unexpected response format.");
        setUsers([]);
        setLoading(false);
        return;
      }

      setUsers(data);
    } catch (err) {
      console.error("Admin loadUsers error:", err);
      setError("Network or server error.");
      setUsers([]);
    }

    setLoading(false);
  }

  async function updateRole(id, role) {
    setMessage("");
    setError("");

    try {
      const res = await apiFetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${id}/role/`,
        {
          method: "POST",
          body: JSON.stringify({ role }),
        }
      );

      if (!res.ok) {
        setError("Failed to update role.");
        return;
      }

      setMessage("Role updated successfully.");
      loadUsers();
    } catch (err) {
      console.error("Admin updateRole error:", err);
      setError("Network or server error.");
    }
  }

  async function deleteUser(id) {
    setMessage("");
    setError("");

    try {
      const res = await apiFetch(
        `${import.meta.env.VITE_API_URL}/api/admin/users/${id}/delete/`,
        { method: "DELETE" }
      );

      if (!res.ok) {
        setError("Failed to delete user.");
        return;
      }

      setMessage("User deleted.");
      loadUsers();
    } catch (err) {
      console.error("Admin deleteUser error:", err);
      setError("Network or server error.");
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <RequireAuth>
      <RequireRole allowed={["admin"]}>
        <Layout>
          <div className="container">
            <h2 className="mb-3">Admin Dashboard</h2>

            {message && <p className="text-success">{message}</p>}
            {error && <p className="text-danger">{error}</p>}

            {loading ? (
              <p>Loading users...</p>
            ) : users.length === 0 ? (
              <p>No users found.</p>
            ) : (
              <div className="card p-4 shadow-sm">
                <h4 className="mb-3">User Management</h4>

                <table className="table table-striped">
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
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td>{u.username}</td>
                        <td>{u.email || "—"}</td>
                        <td>
                          <select
                            className="form-select"
                            value={u.role}
                            onChange={(e) => updateRole(u.id, e.target.value)}
                          >
                            <option value="admin">Admin</option>
                            <option value="teacher">Teacher</option>
                            <option value="student">Student</option>
                            <option value="doctor">Doctor</option>
                            <option value="nurse">Nurse</option>
                            <option value="patient">Patient</option>
                            <option value="user">User</option>
                          </select>
                        </td>
                        <td>
                          {u.date_joined
                            ? new Date(u.date_joined).toLocaleDateString()
                            : "—"}
                        </td>
                        <td>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => deleteUser(u.id)}
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
      </RequireRole>
    </RequireAuth>
  );
}
