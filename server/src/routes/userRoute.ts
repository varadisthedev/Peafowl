import express from "express";
import {
  sendOtpForRegistration,
  verifyOtpAndRegister,
  login,
  getProfile,
  updateMail,
  TestRateLimit,
} from "../controllers/userController.ts";
import { verifyToken } from "../middleware/authMiddleware.ts";

const router = express.Router();

// Public routes (no authentication needed)
// Step 1: Validate inputs & send OTP to email
router.post("/register/send-otp", sendOtpForRegistration);
// Step 2: Submit OTP → create account
router.post("/register/verify-otp", verifyOtpAndRegister);
router.post("/login", login);
router.get("/testRateLimit", TestRateLimit);

// Protected routes (authentication required)
router.get("/profile", verifyToken, getProfile);
router.put("/mailUpdate", verifyToken, updateMail);

export default router;
