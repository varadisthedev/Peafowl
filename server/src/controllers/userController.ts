import userModel from "../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { verifyToken } from "../middleware/authMiddleware";
import dotenv from "dotenv";

dotenv.config();
if (!process.env.NODE_ENV) {
  console.warn("NODE_ENV not set, defaulting to 'development'");
  process.env.NODE_ENV = "development";
}

// Cookie settings for JWT auth for register route and login route,
//  also used in logout route to clear cookie
const baseCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

const cookieOptions = {
  ...baseCookieOptions,
  maxAge: 60 * 60 * 1000,
};

export const register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
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
  } catch (error) {
    res.status(500).json({ message: "Server error", err: error.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
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
      token: token, // Include the token in the response
      //   user: {
      //     id: user._id,
      //     username: user.username,
      //     email: user.email,
      //     role: user.role,
      //   },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

export const logout = (req, res) => {
  // clear auth cookie during logout
  try {
    res.clearCookie("token", baseCookieOptions);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error during logout" });
  }
};

export const getProfile = async (req, res) => {
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

export const updateMail = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await userModel.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found in db" });
    }
    if (email) user.email = email;

    await user.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

export const userRouteCheck = (req, res) => {
  try {
    res.status(200).json({ message: "user route is working" });
  } catch (err) {
    res.status(500).json({ message: "Server error", err: err.message });
  }
};

export default userRouteCheck;
