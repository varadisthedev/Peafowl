import express from "express";
import {
  getMessagesByRoom,
  deleteMessage,
  editMessage,
} from "../controllers/messageController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/room/:roomId", verifyToken, getMessagesByRoom);
router.delete("/:messageId", verifyToken, deleteMessage);
router.put("/:messageId", verifyToken, editMessage);

export default router;
