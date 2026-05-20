import { useState } from "react";
import { authAPI } from "../services/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    console.log("[Page] Register submitted");

    try {
      const res = await authAPI.register({ username, email, password });
      setSuccess(`Account created! User ID: ${res.data.user.id}`);
      setUsername("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Register</h1>
      <form onSubmit={handleRegister}>
        <div>
          <label>Username: </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
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
        <button
          type="submit"
          className="border-2 border-zinc-100 p-2 rounded-md"
        >
          Register
        </button>
      </form>
      {error && <p style={{ color: "red" }}>[ERROR] {error}</p>}
      {success && <p style={{ color: "green" }}>[SUCCESS] {success}</p>}
    </div>
  );
}
