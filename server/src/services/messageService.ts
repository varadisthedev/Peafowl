import { prisma } from "../config/prisma.ts";

/**
 * Persist a new message to Postgres.
 * Called by the socket handler on every SEND_MESSAGE event.
 */
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
    console.error("[MessageService] Error saving message:", error);
    throw error;
  }
};

/**
 * Fetch paginated messages for a room, oldest-first.
 */
export const getMessagesByRoom = async (
  roomId: string,
  limit = 50,
  skip = 0,
) => {
  try {
    const messages = await prisma.message.findMany({
      where: { roomId },
      orderBy: { timestamp: "desc" },
      take: limit,
      skip,
    });
    return messages.reverse(); // return oldest-first for display
  } catch (error) {
    console.error("[MessageService] Error fetching messages:", error);
    throw error;
  }
};
