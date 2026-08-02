import express from "express";
import { getProfile, updateMail } from "./users.controller.ts";
import { verifyToken } from "../../middleware/authMiddleware.ts";

const router = express.Router();

// All routes here require authentication
router.get("/profile", verifyToken, getProfile);
router.put("/mailUpdate", verifyToken, updateMail);

export default router;
