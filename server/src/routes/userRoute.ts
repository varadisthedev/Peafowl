import express from "express";
import {
  register,
  login,
  getProfile,
  updateMail,
} from "../controllers/userController";
import { verifyToken } from "../middleware/authMiddleware";
import user from "../models/User";

const router = express.Router();

// Public routes (no authentication needed)
router.post("/register", register);
router.post("/login", login);

// Protected routes (authentication required)
router.get("/profile", verifyToken, getProfile);
router.put("/mailUpdate", verifyToken, updateMail);

export default router;
