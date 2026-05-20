import { useState } from "react";
import { authAPI } from "../services/api";

export default function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("[Page] Login submitted");

    try {
      const res = await authAPI.login({ email, password });
      console.log("[Page] Login response:", res.data);

      localStorage.setItem("token", res.data.token);
      setEmail("");
      setPassword("");

      // Fetch profile to get username
      const profileRes = await authAPI.getProfile();
      console.log("[Page] Profile fetched:", profileRes.data);

      onLoginSuccess({
        userId: profileRes.data._id,
        username: profileRes.data.username,
        email: profileRes.data.email,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "20px" }} className="border-2 border-black">
      <h1 className="text-black font-extrabold ">Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email: </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Password: </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>
        <button
          type="button"
          onClick={() => (window.location.href = "/register")}
        >
          Register
        </button>
      </form>
      {error && <p style={{ color: "red" }}>[ERROR] {error}</p>}
    </div>
  );
}
