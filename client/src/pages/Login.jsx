import { useState } from "react";
import { authAPI } from "../services/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

export default function Login({ onLoginSuccess, onSwitchToRegister }) {
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
    <div className="mx-auto flex min-h-screen w-full max-w-md items-center px-4">
      <Card className="w-full bg-zinc-900 text-zinc-100 ring-zinc-800">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <p className="text-xs text-zinc-400">
            [REQUEST] POST /api/users/login
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-zinc-800 text-zinc-100"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-300">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-zinc-800 text-zinc-100"
              />
            </div>
            <div className="flex gap-2 pt-1">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Logging in..." : "Login"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onSwitchToRegister}
                className="flex-1"
              >
                Register
              </Button>
            </div>
          </form>
          {error && (
            <p className="mt-3 text-xs text-red-400">[ERROR] {error}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
