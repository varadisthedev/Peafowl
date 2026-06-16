import { useState } from "react";
import { authAPI } from "../services/api";
import { getLoginErrorMessage } from "../lib/authErrors";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

/**
 * Login Component
 * Handles user authentication via email and password.
 * Designed with a minimal black and white aesthetic.
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
    <div className="flex min-h-screen items-center justify-center bg-background p-4 dark">
      <Card className="w-full max-w-sm border-border bg-card shadow-2xl transition-all duration-300">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tighter">
            PEAFOWL
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your credentials to access the chat
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Email
              </label>
              <Input
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-border bg-transparent focus:ring-1 focus:ring-foreground"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-border bg-transparent focus:ring-1 focus:ring-foreground"
              />
            </div>
            {error && (
              <div className="rounded border border-destructive/50 bg-destructive/10 p-2 text-xs text-destructive">
                {error}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-foreground text-background hover:bg-foreground/90"
            >
              {loading ? "Authenticating..." : "Login"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t border-border pt-4">
          <p className="text-center text-xs text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              className="font-semibold text-foreground underline-offset-4 hover:underline"
              onClick={onSwitchToRegister}
            >
              Create an account
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
