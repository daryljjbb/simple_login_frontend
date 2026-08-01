import { useState } from "react";
import "./layout.css";

export default function Layout({ children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="layout-container">
      <aside className={collapsed ? "sidebar collapsed" : "sidebar"}>
        <div className="sidebar-header">
          <h3 className="sidebar-title">{collapsed ? "SL" : "Simple Login"}</h3>

          <div className="sidebar-controls">
            <button
              className="theme-btn"
              onClick={() => document.body.classList.toggle("light-theme")}
            >
              🎨
            </button>

            <button
              className="collapse-btn"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? ">" : "<"}
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          <a href="/dashboard">📊 <span className="link-text">Dashboard</span></a>
          <a href="/notes">📝 <span className="link-text">Notes</span></a>
          <a href="/tasks">📋 <span className="link-text">Tasks</span></a>
          <a href="/profile">👤 <span className="link-text">Profile</span></a>
          <a href="/edit-profile">⚙️ <span className="link-text">Edit Profile</span></a>
          <a href="/change-password">🔐 <span className="link-text">Change Password</span></a>
          <a href="/logout">🚪 <span className="link-text">Logout</span></a>
        </nav>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
