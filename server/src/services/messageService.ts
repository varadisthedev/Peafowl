import Message from "../models/Message";

export const saveMessage = async (messageData) => {
  try {
    const message = new Message(messageData);
    await message.save();
    return message;
  } catch (error) {
    console.error("[MessageService] Error saving message:", error);
    throw error;
  }
};

export const getMessagesByRoom = async (roomId, limit = 50, skip = 0) => {
  try {
    const messages = await Message.find({ roomId })
      .sort({ timestamp: -1 })
      .limit(limit)
      .skip(skip);
    return messages.reverse();
  } catch (error) {
    console.error("[MessageService] Error fetching messages:", error);
    throw error;
  }
};
