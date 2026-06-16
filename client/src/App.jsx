import { useState, useEffect } from "react";
import { connectSocket, disconnectSocket } from "./services/socket";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Chat from "./pages/Chat";

/**
 * Root Application Component
 * Manages global authentication state and page routing.
 * Root of the sleek black-and-white chat application.
 */
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("login"); // "register", "login", or "chat"

  // Check for existing session on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      console.log("[App] Session found, reconnecting...");
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setPage("chat");
        connectSocket();
      } catch (err) {
        console.error("[App] Error parsing saved user session:", err);
        handleLogout(); // Clear corrupted session
      }
    } else {
      console.log("[App] No active session found.");
    }
  }, []);

  /**
   * Handles successful login/registration by updating state and starting socket connection.
   */
  const handleLoginSuccess = (userData) => {
    console.log("[App] Authentication successful for:", userData.username);
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    setPage("chat");
    connectSocket();
  };

  /**
   * Logs out the user and cleans up local storage and socket connections.
   */
  const handleLogout = () => {
    console.log("[App] Terminating session and logging out");
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    disconnectSocket();
    setPage("login");
  };

  const handleSwitchToRegister = () => {
    console.log("[App] Navigating to Register");
    setPage("register");
  };

  const handleSwitchToLogin = () => {
    console.log("[App] Navigating to Login");
    setPage("login");
  };

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {page === "register" && (
        <Register onSwitchToLogin={handleSwitchToLogin} />
      )}

      {page === "login" && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
        />
      )}

      {page === "chat" && user && (
        <Chat user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
