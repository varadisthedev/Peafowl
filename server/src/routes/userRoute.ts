import express from "express";
import {
  register,
  login,
  getProfile,
  updateMail,
  TestRateLimit,
} from "../controllers/userController.ts";
import { verifyToken } from "../middleware/authMiddleware.ts";


const router = express.Router();

// Public routes (no authentication needed)
router.post("/register", register);
router.post("/login", login);
router.get("/testRateLimit", TestRateLimit);

// Protected routes (authentication required)
router.get("/profile", verifyToken, getProfile);
router.put("/mailUpdate", verifyToken, updateMail);

export default router;
