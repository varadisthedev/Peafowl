import { saveMessage } from "./messageService";
import chalk from "chalk";

const log = console.log;
export default function setupSocket(io) {
  io.on("connection", (socket) => {
    log(chalk.greenBright("[Socket] connected to socketId:", socket.id));

    socket.on("join_room", ({ roomId, userId }) => {
      if (!roomId) return;
      socket.join(roomId);
      io.to(roomId).emit("user_joined", { socketId: socket.id, userId });
    });

    socket.on("leave_room", ({ roomId, userId }) => {
      if (!roomId) return;
      socket.leave(roomId);
      io.to(roomId).emit("user_left", { socketId: socket.id, userId });
    });

    socket.on("send_message", async (msg) => {
      // msg expected: { roomId, sender, content, ... }
      if (!msg || !msg.roomId) return;

      try {
        // Save message to MongoDB
        const savedMessage = await saveMessage({
          roomId: msg.roomId,
          sender: msg.sender,
          content: msg.content,
        });

        // Broadcast to room
        io.to(msg.roomId).emit("receive_message", {
          _id: savedMessage._id,
          roomId: savedMessage.roomId,
          sender: savedMessage.sender,
          content: savedMessage.content,
          timestamp: savedMessage.timestamp,
          isEdited: savedMessage.isEdited,
        });
      } catch (error) {
        log(chalk.redBright("[Socket] Error saving message:", error));
        socket.emit("message_error", { error: "Failed to save message" });
      }
    });

    socket.on("typing", ({ roomId, userId, isTyping }) => {
      if (!roomId) return;
      socket.to(roomId).emit("typing", { userId, isTyping });
    });

    socket.on("disconnect", (reason) => {
      log(chalk.redBright("[Socket] disconnected:", socket.id, reason));
    });
  });
}
