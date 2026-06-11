import type { Request, Response, CookieOptions } from "express";
import userModel from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

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
export const register = async (req: Request, res: Response) => {
  const { username, email, password } = req.body as {
    username?: string;
    email?: string;
    password?: string;
  };

  if (!username || !email || !password) {
    return res.status(400).json({ message: "username, email and password are required" });
  }

  try {
    const existingByEmail = await userModel.findOne({ email });
    if (existingByEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const existingByUsername = await userModel.findOne({ username });
    if (existingByUsername) {
      return res.status(400).json({ message: "Username already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      username,
      email,
      password: hashedPassword,
    });
    await newUser.save();
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
      return res.status(409).json({ message: `${key} already exists` });
    }
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
    // chek if user exits 
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

