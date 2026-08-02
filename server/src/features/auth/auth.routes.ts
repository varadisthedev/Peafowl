import express from "express";
import {
  sendOtpForRegistration,
  verifyOtpAndRegister,
  login,
  logout,
} from "./auth.controller.ts";

const router = express.Router();

// Step 1: Validate inputs & send OTP to email
router.post("/register/send-otp", sendOtpForRegistration);
// Step 2: Submit OTP → create account
router.post("/register/verify-otp", verifyOtpAndRegister);
router.post("/login", login);
router.post("/logout", logout);

export default router;
