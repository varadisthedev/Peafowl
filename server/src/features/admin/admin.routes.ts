import express from "express";
import {
  getAllUsers,
  getUserById,
  deleteUserById,
  updateUserRole,
  createAdminAccount,
} from "./admin.controller.ts";

import { verifyToken } from "../../middleware/authMiddleware.ts";
import { adminOnly } from "./admin.middleware.ts";
const router = express.Router();

// All admin routes require authentication AND admin role
router.use(verifyToken); // First check if user is logged in

// Admin routes
router.get("/users", adminOnly, getAllUsers);
router.get("/users/:id", adminOnly, getUserById);
router.delete("/users/:id", adminOnly, deleteUserById);
router.put("/users/:id/role", adminOnly, updateUserRole);
router.patch("/users/:id/role", adminOnly, updateUserRole); // Allow PATCH for role updates

// Creating admin accounts requires an existing admin — the very first admin
// is bootstrapped via `npm run db:seed-admin` (see prisma/seed.ts), not this route.
router.post("/createAccount", adminOnly, createAdminAccount);

export default router;
