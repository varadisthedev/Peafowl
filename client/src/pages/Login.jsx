  import { useState } from "react";
import { authAPI } from "../services/api";
import { getLoginErrorMessage } from "../lib/authErrors";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

/**
 * Login Component
 * Handles user authentication via email and password.
 * Designed with a high-fidelity Discord-inspired dark login panel.
 */
export default function Login({ onLoginSuccess, onSwitchToRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("[Login] Attempting login for:", email);

    try {
      // Step 1: Login to get the JWT token
      const res = await authAPI.login({ email, password });
      console.log("[Login] Success, token received");

      localStorage.setItem("token", res.data.token);

      // Step 2: Fetch user profile to get full details (username, userId)
      console.log("[Login] Fetching user profile...");
      const profileRes = await authAPI.getProfile();
      console.log("[Login] Profile data:", profileRes.data);

      onLoginSuccess({
        userId: profileRes.data._id,
        username: profileRes.data.username,
        email: profileRes.data.email,
      });

      // Clear sensitive fields
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error("[Login] Error during authentication:", err);
      setError(getLoginErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#1e1f22] p-4 select-none">
      {/* Background abstract overlay to resemble Discord's login theme */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--color-discord-blurple)_0%,_transparent_40%)] opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-discord-green)_0%,_transparent_45%)] opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[480px] rounded-lg bg-[#313338] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.2)] text-left transition-all duration-300">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[#f2f3f5]">
            Welcome back!
          </h2>
          <p className="mt-1 text-sm text-[#b5bac1]">
            We're so excited to see you again!
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#b5bac1] flex gap-1">
              Email <span className="text-[#f23f43]">*</span>
            </label>
            <Input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-10 w-full rounded border-none bg-[#1e1f22] px-3 py-2 text-[14px] text-[#f2f3f5] transition-colors focus-visible:ring-1 focus-visible:ring-[#5865f2] placeholder:text-[#949ba4] focus-visible:border-none focus-visible:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#b5bac1] flex gap-1">
              Password <span className="text-[#f23f43]">*</span>
            </label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-10 w-full rounded border-none bg-[#1e1f22] px-3 py-2 text-[14px] text-[#f2f3f5] transition-colors focus-visible:ring-1 focus-visible:ring-[#5865f2] placeholder:text-[#949ba4] focus-visible:border-none focus-visible:outline-none"
            />
            <button
              type="button"
              className="text-xs font-semibold text-[#00a8fc] hover:underline block"
            >
              Forgot your password?
            </button>
          </div>

          {error && (
            <div className="rounded border border-[#f23f43]/40 bg-[#f23f43]/10 p-2.5 text-xs text-[#f23f43]">
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded bg-[#5865f2] font-semibold text-white hover:bg-[#4752c4] active:bg-[#3c45a5] transition-colors disabled:opacity-50 text-[14px]"
          >
            {loading ? "Logging in..." : "Log In"}
          </Button>
        </form>

        <div className="mt-4 text-left">
          <span className="text-xs text-[#949ba4]">
            Need an account?{" "}
            <button
              type="button"
              className="text-xs font-semibold text-[#00a8fc] hover:underline"
              onClick={onSwitchToRegister}
            >
              Register
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}
