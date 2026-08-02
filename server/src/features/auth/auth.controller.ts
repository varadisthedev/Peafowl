import type { Request, Response, CookieOptions } from "express";
import { prisma } from "../../config/prisma.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "../../config/env.ts";
import { Prisma } from "../../generated/prisma/client.ts";

// OTP + pending-user helpers
import {
  sendOtp,
  verifyOtp,
  storePendingUser,
  getPendingUser,
  deletePendingUser,
} from "./auth.service.ts";

// Cookie settings for JWT auth for register route and login route,
//  also used in logout route to clear cookie
const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: env.IS_PRODUCTION,
  sameSite: "lax",
  // lax prevent CSRF attacks while still allowing the cookie to be sent on top-level navigation (like clicking a link)
  // csrf means cross site request forgery 
};

const cookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
};

/**
 * Step 1 — Validate inputs, store pending user in Redis, send OTP.
 * Postgres is NOT touched yet.
 */
export const sendOtpForRegistration = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = req.body as {
      username?: string;
      email?: string;
      password?: string;
    };

    if (!username || !email || !password) {
      res.status(400).json({ message: "username, email and password are required" });
      return;
    }

    // Check uniqueness before bothering Resend's API
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }
    const existingByUsername = await prisma.user.findUnique({ where: { username } });
    if (existingByUsername) {
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    // Hash password now so we don't store plaintext in Redis
    const hashedPassword = await bcrypt.hash(password, 10);

    // Persist pending user in Redis (TTL matches OTP expiry — 5 min)
    await storePendingUser({ username, email, hashedPassword });

    // Send OTP email
    const sendOtpResult = await sendOtp(email);
    if (!sendOtpResult.success) {
      res.status(500).json({ message: "Failed to send OTP", err: sendOtpResult.message });
      return;
    }

    res.status(200).json({ message: "OTP sent to your email. Please verify to complete registration." });
  } catch (error: any) {
    console.error("[register/send-otp]", error?.message);
    res.status(500).json({ message: "Server error", err: error?.message });
  }
};

/**
 * Step 2 — Verify the OTP submitted by the user, then create the account.
 * Only writes to Postgres once the OTP is confirmed.
 */
export const verifyOtpAndRegister = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body as { email?: string; otp?: string };

    if (!email || !otp) {
      res.status(400).json({ message: "email and otp are required" });
      return;
    }

    // Verify the OTP (also handles expiry + brute-force check)
    const verifyResult = await verifyOtp(email, otp);
    if (!verifyResult.success) {
      res.status(verifyResult.status).json({ message: verifyResult.message });
      return;
    }

    // Pull the pending user payload back from Redis
    const pending = await getPendingUser(email);
    if (!pending) {
      res
        .status(400)
        .json({ message: "Registration session expired. Please start over." });
      return;
    }

    // Guard against a race where the email/username was taken during the OTP window
    const existingByEmail = await prisma.user.findUnique({ where: { email } });
    if (existingByEmail) {
      await deletePendingUser(email);
      res.status(409).json({ message: "Email already exists" });
      return;
    }
    const existingByUsername = await prisma.user.findUnique({ where: { username: pending.username } });
    if (existingByUsername) {
      await deletePendingUser(email);
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    // All good — create the user
    const newUser = await prisma.user.create({
      data: {
        username: pending.username,
        email: pending.email,
        password: pending.hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
      },
    });

    // Clean up pending user from Redis
    await deletePendingUser(email);

    res.status(201).json({
      message: "User registered successfully",
      user: newUser,
    });
  } catch (error: any) {
    // Prisma unique constraint violation code
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const field = (error.meta?.target as string[])?.join(", ") ?? "field";
      res.status(409).json({ message: `${field} already exists` });
      return;
    }
    console.error("[register/verify-otp]", error?.message);
    res.status(500).json({ message: "Server error", err: error?.message });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) {
    return res.status(400).json({ message: "email and password are required" });
  }
  try {
    // password field must be explicitly selected since it is not selected by default
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        role: true,
        username: true,
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "please register, account not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // generate JWT token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.cookie("token", token, cookieOptions);

    res.status(200).json({
      message: "Login successful",
      token: token,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Server error", err: error?.message });
  }
};

export const logout = (req: Request, res: Response) => {
  // clear auth cookie during logout
  try {
    res.clearCookie("token", baseCookieOptions);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error during logout" });
  }
};
