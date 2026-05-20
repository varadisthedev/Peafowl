import express from "express";
import {
  getMessagesByRoom,
  deleteMessage,
  editMessage,
} from "../controllers/messageController.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get all messages for a room
router.get("/room/:roomId", verifyToken, getMessagesByRoom);
router.delete("/:messageId", verifyToken, deleteMessage);
router.put("/:messageId", verifyToken, editMessage);

export default router;
