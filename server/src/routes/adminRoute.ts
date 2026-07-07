import express from "express";
import {
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserRole,
  createAdminAccount,
} from "../controllers/adminController.ts";

import { verifyToken } from "../middleware/authMiddleware.ts";
import { adminOnly } from "../middleware/roleMiddleware.ts";
const router = express.Router();
router.post("/createAccount", createAdminAccount); // Allow POST for creating admin accounts

// All admin routes require authentication AND admin role
router.use(verifyToken); // First check if user is logged in
// router.use(adminOnly); // Then check if user is admin

// Admin routes
router.get("/users", adminOnly, getAllUsers);
router.get("/users/:id", adminOnly, getUserById);
router.delete("/users/:id", adminOnly, deleteUserById);
router.put("/users/:id/role", adminOnly, updateUserRole);
// router.get("/dashboard/stats", getDashboardStats);
// router.get("/dashboard"); // Placeholder for future dashboard route
// router.get("/settings"); // Placeholder for future settings route
// router.get("/reports"); // Placeholder for future reports route

router.patch("/users/:id/role", adminOnly, updateUserRole); // Allow PATCH for role updates

export default router; // deafult export can be any name while importing
// but we will use adminRouter for consistency with other route files
