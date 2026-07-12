import { useState } from "react";
import { authAPI } from "../services/api";
import { getRegisterErrorMessage } from "../lib/authErrors";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";

/**
 * Register Component
 * Handles new user account creation via a 2-step OTP verification flow.
 * Designed with a high-fidelity Discord-inspired dark registration panel.
 */
export default function Register({ onSwitchToLogin }) {
  const [step, setStep] = useState("credentials"); // "credentials" or "otp"
  
  // Credentials state
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // OTP state
  const [otp, setOtp] = useState("");
  
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    console.log("[Register] Requesting OTP for:", email);

    try {
      const res = await authAPI.sendOtp({ username, email, password });
      console.log("[Register] sendOtp Success:", res.data);
      
      // Transition to OTP verification step
      setStep("otp");
    } catch (err) {
      console.error("[Register] Error during sendOtp:", err);
      setError(getRegisterErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    console.log("[Register] Submitting OTP verification:", otp);

    try {
      const res = await authAPI.verifyOtp({ email, otp: otp.trim() });
      console.log("[Register] verifyOtp Success:", res.data);

      setSuccess(true);
      
      // Clear fields
      setUsername("");
      setEmail("");
      setPassword("");
      setOtp("");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        onSwitchToLogin();
      }, 2000);
    } catch (err) {
      console.error("[Register] Error during OTP verification:", err);
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    console.log("[Register] Resending OTP to:", email);
    try {
      await authAPI.sendOtp({ username, email, password });
      alert("Verification code resent!");
    } catch (err) {
      console.error("[Register] Resend OTP error:", err);
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#1e1f22] p-4 select-none">
      {/* Background abstract overlay to resemble Discord's theme */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--color-discord-blurple)_0%,_transparent_40%)] opacity-30 pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--color-discord-green)_0%,_transparent_45%)] opacity-20 pointer-events-none" />

      <div className="relative z-10 w-full max-w-[480px] rounded-lg bg-[#313338] p-8 shadow-[0_8px_24px_rgba(0,0,0,0.2)] text-left transition-all duration-300">
        
        {step === "credentials" ? (
          /* Step 1: Collect credentials */
          <>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-[#f2f3f5]">
                Create an account
              </h2>
            </div>

            <form onSubmit={handleSendOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#b5bac1] flex gap-1">
                  Username <span className="text-[#f23f43]">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="h-10 w-full rounded border-none bg-[#1e1f22] px-3 py-2 text-[14px] text-[#f2f3f5] transition-colors focus-visible:ring-1 focus-visible:ring-[#5865f2] placeholder:text-[#949ba4] focus-visible:border-none focus-visible:outline-none"
                />
              </div>

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
                {loading ? "Sending code..." : "Register"}
              </Button>
            </form>

            <div className="mt-4 text-left">
              <button
                type="button"
                className="text-xs font-semibold text-[#00a8fc] hover:underline"
                onClick={onSwitchToLogin}
              >
                Already have an account?
              </button>
            </div>
          </>
        ) : (
          /* Step 2: Verification of OTP */
          <>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-[#f2f3f5]">
                Enter verification code
              </h2>
              <p className="mt-1.5 text-xs text-[#b5bac1] leading-relaxed">
                We sent a 6-digit verification code to <strong className="text-white font-semibold">{email}</strong>. Enter it below to complete registration.
              </p>
            </div>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#b5bac1] flex gap-1">
                  Verification Code <span className="text-[#f23f43]">*</span>
                </label>
                <Input
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  className="h-11 w-full rounded border-none bg-[#1e1f22] px-3 py-2 text-center text-[18px] font-bold tracking-[0.4em] text-white transition-colors focus-visible:ring-1 focus-visible:ring-[#5865f2] placeholder:text-[#949ba4] focus-visible:outline-none"
                  autoFocus
                />
              </div>

              {error && (
                <div className="rounded border border-[#f23f43]/40 bg-[#f23f43]/10 p-2.5 text-xs text-[#f23f43]">
                  {error}
                </div>
              )}

              {success && (
                <div className="rounded border border-[#23a55a]/40 bg-[#23a55a]/10 p-2.5 text-xs text-[#23a55a]">
                  Registration successful! Redirecting to login...
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || success}
                className="h-11 w-full rounded bg-[#23a55a] font-semibold text-white hover:bg-[#1a7f43] transition-colors disabled:opacity-50 text-[14px]"
              >
                {loading ? "Verifying..." : "Verify & Create Account"}
              </Button>
            </form>

            <div className="mt-5 flex items-center justify-between text-xs font-semibold">
              <button
                type="button"
                className="text-[#00a8fc] hover:underline"
                onClick={handleResendOtp}
                disabled={loading}
              >
                Resend Code
              </button>
              
              <button
                type="button"
                className="text-[#949ba4] hover:text-[#f2f3f5] hover:underline"
                onClick={() => {
                  setStep("credentials");
                  setError("");
                }}
              >
                Edit credentials
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
