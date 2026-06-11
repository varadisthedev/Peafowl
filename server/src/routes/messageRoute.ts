import express from "express";
import {
  getMessagesByRoom,
  deleteMessage,
  editMessage,
  pinMessage,
} from "../controllers/messageController";
import { verifyToken } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/room/:roomId", verifyToken, getMessagesByRoom);
router.delete("/:messageId", verifyToken, deleteMessage);
router.put("/:messageId", verifyToken, editMessage);
router.patch("/:messageId/pin", verifyToken, pinMessage);

export default router;
