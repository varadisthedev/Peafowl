import { saveMessage } from "../messages/messages.service.ts";
import { SOCKET_EMIT_EVENTS, SOCKET_LISTEN_EVENTS } from "./chat.types.ts";
import chalk from "chalk";

const log = console.log;

/**
 * Track which rooms each socket has joined so we can clean up on disconnect.
 */
const socketRooms = new Map<string, Set<string>>();
const socketUserIds = new Map<string, string>();

function trackRoomJoin(socketId: string, roomId: string, userId: string) {
  if (!socketRooms.has(socketId)) {
    socketRooms.set(socketId, new Set());
  }
  socketRooms.get(socketId)!.add(roomId);
  socketUserIds.set(socketId, userId);
}

function trackRoomLeave(socketId: string, roomId: string) {
  socketRooms.get(socketId)?.delete(roomId);
}

export default function setupSocket(io) {
  io.on("connection", (socket) => {
    log(chalk.greenBright("[Socket] connected to socketId:", socket.id));

    socket.on(SOCKET_LISTEN_EVENTS.JOIN_ROOM, async ({ roomId, userId }) => {
      if (!roomId || !userId) return;

      socket.join(roomId);
      trackRoomJoin(socket.id, roomId, userId);

      io.to(roomId).emit(SOCKET_EMIT_EVENTS.USER_JOINED, {
        socketId: socket.id,
        userId,
        roomId,
      });
    });

    socket.on(SOCKET_LISTEN_EVENTS.LEAVE_ROOM, async ({ roomId, userId }) => {
      if (!roomId) return;

      socket.leave(roomId);
      trackRoomLeave(socket.id, roomId);

      // Clear typing state when leaving
      if (userId) {
        socket.to(roomId).emit(SOCKET_EMIT_EVENTS.TYPING_STATUS, {
          roomId,
          userId,
          isTyping: false,
        });
      }

      io.to(roomId).emit(SOCKET_EMIT_EVENTS.USER_LEFT, {
        socketId: socket.id,
        userId,
        roomId,
      });
    });

    socket.on(SOCKET_LISTEN_EVENTS.SEND_MESSAGE, async (msg) => {
      if (!msg || !msg.roomId) return;

      try {
        const savedMessage = await saveMessage({
          roomId: msg.roomId,
          senderId: Number(msg.sender), // sender is userId from client
          content: msg.content,
        });

        io.to(msg.roomId).emit(SOCKET_EMIT_EVENTS.RECEIVE_MESSAGE, {
          _id: savedMessage.id,
          roomId: savedMessage.roomId,
          sender: savedMessage.senderId,
          content: savedMessage.content,
          timestamp: savedMessage.timestamp,
          isEdited: savedMessage.isEdited,
        });
      } catch (error) {
        log(chalk.redBright("[Socket] Error saving message:", error));
        socket.emit(SOCKET_EMIT_EVENTS.MESSAGE_ERROR, {
          error: "Failed to save message",
        });
      }
    });

    socket.on(
      SOCKET_LISTEN_EVENTS.TYPING,
      async ({ roomId, userId, isTyping }) => {
        if (!roomId || !userId) return;

        // Exclude the sender — they already know they're typing
        socket.to(roomId).emit(SOCKET_EMIT_EVENTS.TYPING_STATUS, {
          roomId,
          userId,
          isTyping: Boolean(isTyping),
        });
      },
    );

    socket.on("disconnect", async (reason) => {
      log(chalk.redBright("[Socket] disconnected:", socket.id, reason));

      const rooms = socketRooms.get(socket.id);
      const userId = socketUserIds.get(socket.id);

      if (rooms && userId) {
        for (const roomId of rooms) {
          socket.to(roomId).emit(SOCKET_EMIT_EVENTS.TYPING_STATUS, {
            roomId,
            userId,
            isTyping: false,
          });
          socket.to(roomId).emit(SOCKET_EMIT_EVENTS.USER_LEFT, {
            socketId: socket.id,
            userId,
            roomId,
          });
        }
      }

      socketRooms.delete(socket.id);
      socketUserIds.delete(socket.id);
    });
  });
}
