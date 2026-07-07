import type { Request, Response } from "express";
import { prisma } from "../config/prisma.ts";
import { Prisma } from "../generated/prisma/client.ts";

// ─── Internal save helper (used by messageService + socket) ──────────────────

export const saveMessage = async (messageData: {
  roomId: string;
  senderId: number;
  content: string;
}) => {
  try {
    const message = await prisma.message.create({
      data: {
        roomId: messageData.roomId,
        senderId: messageData.senderId,
        content: messageData.content,
      },
    });
    return message;
  } catch (error) {
    console.error("[MessageController] Error saving message:", error);
    throw error;
  }
};

// ─── HTTP handlers ────────────────────────────────────────────────────────────

export const getMessagesByRoom = async (req: Request, res: Response) => {
  try {
    const roomId = req.params["roomId"] as string;
    const limit = parseInt((req.query.limit as string) ?? "50", 10);
    const skip = parseInt((req.query.skip as string) ?? "0", 10);

    const [messages, totalCount] = await prisma.$transaction([
      prisma.message.findMany({
        where: { roomId },
        orderBy: { timestamp: "desc" },
        take: limit,
        skip,
      }),
      prisma.message.count({ where: { roomId } }),
    ]);

    return res.status(200).json({
      success: true,
      messages: messages.reverse(), // oldest-first for display
      totalCount,
    });
  } catch (error: any) {
    console.error("[MessageController] Error fetching messages:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const messageId = parseInt(req.params["messageId"] as string, 10);
    if (isNaN(messageId)) {
      return res.status(400).json({ success: false, message: "Invalid message id" });
    }

    const message = await prisma.message.findUnique({ where: { id: messageId } });

    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    if (message.senderId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this message",
      });
    }

    await prisma.message.delete({ where: { id: messageId } });

    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error: any) {
    console.error("[MessageController] Error deleting message:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const editMessage = async (req: Request, res: Response) => {
  try {
    const messageId = parseInt(req.params["messageId"] as string, 10);
    if (isNaN(messageId)) {
      return res.status(400).json({ success: false, message: "Invalid message id" });
    }

    const { content } = req.body as { content?: string };
    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "Content is required" });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: updatedMessage,
    });
  } catch (error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return res.status(404).json({ success: false, message: "Message not found" });
    }
    console.error("[MessageController] Error editing message:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const pinMessage = async (req: Request, res: Response) => {
  try {
    const messageId = parseInt(req.params["messageId"] as string, 10);
    if (isNaN(messageId)) {
      return res.status(400).json({ success: false, message: "Invalid message id" });
    }

    const userId: number | undefined = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const message = await prisma.message.findUnique({ where: { id: messageId } });

    if (!message) {
      return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (message.senderId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to pin this message",
      });
    }

    const pinnedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        isPinned: true,
        pinnedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: "Message pinned successfully",
      pinnedMessage,
    });
  } catch (error: any) {
    console.error("[MessageController] Error pinning message:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
