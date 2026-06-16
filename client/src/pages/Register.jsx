import { useState } from "react";
import { authAPI } from "../services/api";
import { getRegisterErrorMessage } from "../lib/authErrors";
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
 * Register Component
 * Handles new user account creation.
 * Designed with a minimal black and white aesthetic.
 */
export default function Register({ onSwitchToLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    console.log("[Register] Attempting to create account for:", username);

    try {
      const res = await authAPI.register({ username, email, password });
      console.log("[Register] Success:", res.data);

      setSuccess(true);
      // Clear fields
      setUsername("");
      setEmail("");
      setPassword("");

      // Optionally redirect to login after a delay
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err) {
      console.error("[Register] Error during registration:", err);
      setError(getRegisterErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 dark">
      <Card className="w-full max-w-sm border-border bg-card shadow-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-3xl font-bold tracking-tighter">
            JOIN PEAFOWL
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Create an account to start chatting
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Username
              </label>
              <Input
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="border-border bg-transparent focus:ring-1 focus:ring-foreground"
              />
            </div>
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
            {success && (
              <div className="rounded border border-green-500/50 bg-green-500/10 p-2 text-xs text-green-500">
                Registration successful! Redirecting to login...
              </div>
            )}
            <Button
              type="submit"
              disabled={loading || success}
              className="w-full bg-foreground text-background hover:bg-foreground/90"
            >
              {loading ? "Creating Account..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 border-t border-border pt-4">
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              className="font-semibold text-foreground underline-offset-4 hover:underline"
              onClick={onSwitchToLogin}
            >
              Login here
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
