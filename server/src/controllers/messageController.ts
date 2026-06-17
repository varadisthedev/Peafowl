import type { Request, Response } from "express";
import Message from "../models/Message.ts";

export const saveMessage = async (messageData) => {
  try {
    const message = new Message(messageData);
    await message.save();
    return message;
  } catch (error) {
    console.error("[MessageController] Error saving message:", error);
    throw error;
  }
};

export const getMessagesByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit = 50, skip = 0 } = req.query;

    const messages = await Message.find({ roomId })
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const totalCount = await Message.countDocuments({ roomId });

    return res.status(200).json({
      success: true,
      messages: messages.reverse(), // reverse to show oldest first
      totalCount,
    });
  } catch (error) {
    console.error("[MessageController] Error fetching messages:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const message = await Message.findById(messageId);


    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    if (message.sender.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to delete this message",
      });
    }

    await message.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Message deleted successfully",
    });
  } catch (error) {
    console.error("[MessageController] Error deleting message:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const editMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res
        .status(400)
        .json({ success: false, message: "Content is required" });
    }

    const updatedMessage = await Message.findByIdAndUpdate(
      messageId,
      {
        content,
        isEdited: true,
        editedAt: new Date(),
      },
      { new: true },
    );

    if (!updatedMessage) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    return res.status(200).json({
      success: true,
      message: updatedMessage,
    });
  } catch (error) {
    console.error("[MessageController] Error editing message:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const pinMessage = async (req: Request, res: Response) => {
  try {
    const { messageId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    if (message.sender.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to pin this message",
      });
    }

    message.isPinned = true;
    message.pinnedAt = new Date();
    await message.save();

    return res.status(200).json({
      success: true,
      message: "Message pinned successfully",
      pinnedMessage: message,
    });
  } catch (error) {
    console.error("[MessageController] Error pinning message:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};
