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
    // removing token from local storage to prevent unauthorized access
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);

    disconnectSocket();
    setPage("login");
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
    <div className="min-h-screen min-w-screen bg-zinc-950 text-zinc-100">
      {page === "register" && (
        <div>
          <Register />
          <div className="mx-auto max-w-md px-4 pb-8 text-center text-sm text-zinc-400">
            Already have an account?{" "}
            <button
              type="button"
              className="text-zinc-100 underline"
              onClick={handleSwitchToLogin}
            >
              Login
            </button>
          </div>
        </div>
      )}

      {page === "login" && (
        <Login
          onLoginSuccess={handleLoginSuccess}
          onSwitchToRegister={handleSwitchToRegister}
        />
      )}

      {page === "chat" && user && <Chat user={user} onLogout={handleLogout} />}
    </div>
  );
}
