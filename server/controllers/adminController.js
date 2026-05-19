import userModel from "../models/User.js";
import bcrypt from "bcrypt";
export const getAllUsers = async (req, res) => {
  try {
    const users = await userModel.find({}, { username: 1, email: 1, _id: 0 });
    res.send(users);
  } catch (error) {
    res.status(500).json({ message: "Server error with the database" });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id, {
      username: 1,
      email: 1,
      role: 1,
      _id: 0,
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.send(user);
  } catch (error) {
    res.status(500).json({ message: "Server error with the database" });
  }
};

export const deleteUserById = async (req, res) => {
  try {
    const user = await userModel.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error with the database" });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true },
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({
      message:
        "User role updated successfully for user: " +
        user.username +
        " to role: " +
        user.role,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error with the database" });
  }
};

export const createAdminAccount = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ message: "Username, email and password are required" });
    }
    const existingUser = await userModel.findOne({
      $or: [{ username }, { email }],
    });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this username or email already exists" });
    }
    const newAdmin = new userModel({
      username,
      email,
      password,
      role: "admin",
    });
    newAdmin.password = await bcrypt.hash(password, 10);
    await newAdmin.save();
    res.status(201).json({
      message: "Admin account created successfully",
      email: newAdmin.email,
    });
  } catch (err) {
    res.status(500).json({
      message: "Server error with the database",
      "error message": err.message,
    });
  }
};
