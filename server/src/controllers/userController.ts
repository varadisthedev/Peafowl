import type { Request, Response, CookieOptions } from "express";
import userModel from "../models/User.ts";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

// OTP + pending-user helpers
import {
  sendOtp,
  verifyOtp,
  storePendingUser,
  getPendingUser,
  deletePendingUser,
} from "../services/otpService.ts";

dotenv.config();
if (!process.env.NODE_ENV) {
  console.warn("NODE_ENV not set, defaulting to 'development'");
  process.env.NODE_ENV = "development";
}

// Cookie settings for JWT auth for register route and login route,
//  also used in logout route to clear cookie
const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

const cookieOptions: CookieOptions = {
  ...baseCookieOptions,
  maxAge: 60 * 60 * 1000,
};

export const TestRateLimit = async (req: Request, res: Response) => {
  res.status(200).json({ message: "Rate limit test successful" });
};

/**
 * Step 1 — Validate inputs, store pending user in Redis, send OTP.
 * MongoDB is NOT touched yet.
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
    const existingByEmail = await userModel.findOne({ email });
    if (existingByEmail) {
      res.status(409).json({ message: "Email already exists" });
      return;
    }
    const existingByUsername = await userModel.findOne({ username });
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
 * Only writes to MongoDB once the OTP is confirmed.
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
    const existingByEmail = await userModel.findOne({ email });
    if (existingByEmail) {
      await deletePendingUser(email);
      res.status(409).json({ message: "Email already exists" });
      return;
    }
    const existingByUsername = await userModel.findOne({ username: pending.username });
    if (existingByUsername) {
      await deletePendingUser(email);
      res.status(409).json({ message: "Username already exists" });
      return;
    }

    // All good — create the user
    const newUser = new userModel({
      username: pending.username,
      email: pending.email,
      password: pending.hashedPassword,
    });
    await newUser.save();

    // Clean up pending user from Redis
    await deletePendingUser(email);

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error: any) {
    if (error?.code === 11000) {
      const key = error.keyValue ? Object.keys(error.keyValue)[0] : "field";
      res.status(409).json({ message: `${key} already exists` });
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
    const user = await userModel.findOne({ email }).select("+password");
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
      { userId: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    res.cookie("token", token, cookieOptions);
    // storing cookie in the token variable and sending it

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

export const getProfile = async (req: Request, res: Response) => {
  try {
    const user = await userModel.findById(req.user.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found in db" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Server error", err: error.message });
  }
};

export const updateMail = async (req: Request, res: Response) => {
  try {
    // check if user exists
    // check if new mail already exists
    // check if current mail matches the one in db
    // check if new mail is valid format (regex)
    // check if new mail is same as current mail
    // if all checks pass, update mail and save user

    const { currentMail, newMail } = req.body as { currentMail?: string; newMail?: string };
    if (!currentMail || !newMail) {
      return res.status(400).json({ message: "currentMail and newMail are required" });
    }
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found in db" });
    }
    if (user.email !== currentMail) {
      return res.status(400).json({ message: "currentMail does not match our records" });
    }
    if (currentMail === newMail) {
      return res.status(400).json({ message: "newMail cannot be the same as currentMail" });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMail)) {
      return res.status(400).json({ message: "newMail is not a valid email format" });
    }
    if (await userModel.findOne({ email: newMail })) {
      return res.status(400).json({ message: "newMail already exists" });
    }
    user.email = newMail;
    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};
