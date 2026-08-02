import { Resend } from "resend";
import redis from "../../config/redis.ts";
import crypto from "crypto";
import { env } from "../../config/env.ts";

const resend = new Resend(env.RESEND_API_KEY);

const OTP_TTL = 420;           // 7 minutes (seconds)
const MAX_OTP_ATTEMPTS = 5;    // max wrong guesses before lockout

// ─── Helpers ────────────────────────────────────────────────────────────────

// SHA-256 is plenty for a short-lived 6-digit code and is ~100x faster than bcrypt
const hashOtp = (otp: string): string =>
    crypto.createHash("sha256").update(otp).digest("hex");

// ─── Pending-user storage ────────────────────────────────────────────────────
// During the 2-step registration flow we keep the validated user payload in
// Redis (TTL = OTP expiry) so we never touch Postgres until OTP is confirmed.

interface PendingUser {
    username: string;
    email: string;
    hashedPassword: string; // already bcrypt-hashed by the controller
}

export const storePendingUser = async (data: PendingUser): Promise<void> => {
    await redis.set(
        `pending_user:${data.email}`,
        JSON.stringify(data),
        "EX",
        OTP_TTL,
    );
};

export const getPendingUser = async (email: string): Promise<PendingUser | null> => {
    const raw = await redis.get(`pending_user:${email}`);
    if (!raw) return null;
    return JSON.parse(raw) as PendingUser;
};

export const deletePendingUser = async (email: string): Promise<void> => {
    await redis.del(`pending_user:${email}`);
};



// ─── OTP send ────────────────────────────────────────────────────────────────

export const sendOtp = async (userMail: string) => {
    try {
        const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
        console.log(`[OTP DEBUG] Generated OTP for ${userMail} is: ${otp}`);
        const hashedOtp = hashOtp(otp);

        // Store hashed OTP with TTL
        await redis.set(`otp:${userMail}`, hashedOtp, "EX", OTP_TTL);
        // Reset attempt counter whenever a fresh OTP is sent
        await redis.del(`otp_attempts:${userMail}`);

        await resend.emails.send({
            from: env.RESEND_FROM_EMAIL,
            to: userMail,
            subject: "Your Peafowl verification code",
            html: `
                <div style="font-family:sans-serif;max-width:480px;margin:auto">
                    <h2 style="color:#6366f1">Peafowl — Email Verification</h2>
                    <p>Use the code below to verify your email address. It expires in <strong>5 minutes</strong>.</p>
                    <div style="font-size:2rem;font-weight:bold;letter-spacing:.5rem;padding:16px;background:#f3f4f6;border-radius:8px;text-align:center">
                        ${otp}
                    </div>
                    <p style="color:#6b7280;font-size:.85rem">If you didn't request this, you can safely ignore it.</p>
                </div>
            `,
        });

        return { success: true, message: "OTP sent successfully" };
    } catch (err: any) {
        console.error("[OTP] sendOtp error:", err.message);
        return { success: false, message: "Failed to send OTP" };
    }
};

// ─── OTP verify ──────────────────────────────────────────────────────────────

export const verifyOtp = async (userMail: string, otp: string) => {
    try {
        // Check attempt count first
        const attemptsKey = `otp_attempts:${userMail}`;
        const attempts = parseInt((await redis.get(attemptsKey)) ?? "0", 10);
        if (attempts >= MAX_OTP_ATTEMPTS) {
            return { status: 429, success: false, message: "Too many incorrect attempts. Request a new OTP." };
        }

        const storedOtp = await redis.get(`otp:${userMail}`);
        if (!storedOtp) {
            return { status: 400, success: false, message: "OTP expired or not found" };
        }

        if (hashOtp(otp) !== storedOtp) {
            // Increment attempt counter (keep same TTL as OTP so it auto-clears)
            const remaining = await redis.ttl(`otp:${userMail}`);
            await redis.set(attemptsKey, attempts + 1, "EX", remaining > 0 ? remaining : OTP_TTL);
            return { status: 400, success: false, message: "Invalid OTP" };
        }

        // OTP is correct — clean up both keys so it can't be reused
        await redis.del(`otp:${userMail}`);
        await redis.del(attemptsKey);
        return { success: true, status: 200, message: "OTP verified successfully" };
    } catch (err: any) {
        console.error("[OTP] verifyOtp error:", err.message);
        return { status: 500, success: false, message: "Failed to verify OTP" };
    }
};
