import { useState,useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Logout from "./pages/Logout.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import ChangePassword from "./pages/ChangePassword.jsx";
import Notes from "./pages/Notes.jsx"
import EditNote from "./pages/EditNote.jsx";
import Tasks from "./pages/Tasks.jsx";
import RequireRole from "./components/RequireRole.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import RequireAuth from "./components/RequireAuth.jsx";
import Layout from "./components/Layout.jsx";




function App() {
  const [count, setCount] = useState(0)

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

  useEffect(() => {
    document.body.setAttribute("data-bs-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
  setTheme(theme === "light" ? "dark" : "light");
};



  return (
    <Layout theme={theme} toggleTheme={toggleTheme}>
    <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/logout" element={<Logout />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <RequireRole allowed={["admin"]}>
              <AdminDashboard />
            </RequireRole>
          </RequireAuth>
        }
      />
      <Route
        path="/dashboard"
        element={
          <RequireAuth>
            <Dashboard />
          </RequireAuth>
        }
      />
      <Route path="/profile" element={<Profile />} />
      <Route path="/edit-profile" element={<EditProfile />} />
      <Route path="/change-password" element={<ChangePassword />} />
      <Route path="/notes" element={<Notes />} />
      <Route path="/notes/:id/edit" element={<EditNote />} />
      <Route path="/tasks" element={<Tasks />} />

    </Routes>
  </BrowserRouter>
  </Layout>
  )
}

export default App
