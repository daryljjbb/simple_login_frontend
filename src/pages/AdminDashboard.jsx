import { useEffect, useState } from "react";
import Layout from "../components/Layout.jsx";
import RequireAuth from "../components/RequireAuth.jsx";
import RequireRole from "../components/RequireRole.jsx";
import { apiFetch } from "../utils/api";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  async function loadUsers() {
    const res = await apiFetch(`${import.meta.env.VITE_API_URL}/api/admin/users/`);
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
  }

  async function updateRole(id, role) {
    const res = await apiFetch(
      `${import.meta.env.VITE_API_URL}/api/admin/users/${id}/role/`,
      {
        method: "POST",
        body: JSON.stringify({ role }),
      }
    );

    if (res.ok) {
      setMessage("Role updated successfully.");
      loadUsers();
    } else {
      setMessage("Failed to update role.");
    }
  }

  async function deleteUser(id) {
    const res = await apiFetch(
      `${import.meta.env.VITE_API_URL}/api/admin/users/${id}/delete/`,
      { method: "DELETE" }
    );

    if (res.ok) {
      setMessage("User deleted.");
      loadUsers();
    } else {
      setMessage("Failed to delete user.");
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
                      <td>{new Date(u.date_joined).toLocaleDateString()}</td>
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
          </div>
        </Layout>
      </RequireRole>
    </RequireAuth>
  );
}
