import { useState, useEffect } from "react";
import { connectSocket, disconnectSocket } from "./services/socket";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Chat from "./pages/Chat";

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login"); // "register", "login", or "chat"

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      console.log("[App] User already logged in");
      setUser(JSON.parse(savedUser));
      setPage("chat");
      connectSocket();
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    console.log("[App] Login successful, user:", userData);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setPage("chat");
    connectSocket();
  };

  const handleLogout = () => {
    console.log("[App] Logging out");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setPage("login");
    disconnectSocket();
  };

  const handleSwitchToRegister = () => {
    console.log("[App] Switching to register page");
    setPage("register");
  };

  const handleSwitchToLogin = () => {
    console.log("[App] Switching to login page");
    setPage("login");
  };

  return (
    <>
      <Login />
      <Register />
    </>
  );
}
