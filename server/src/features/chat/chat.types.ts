/**
 * Chat socket event names and payload types.
 *
 * Events are broadcast directly via Socket.IO (io.to(roomId).emit(...)) —
 * see chat.gateway.ts. No message bus involved; see docs/chat-scaling.md for
 * why, and the preserved Redis Streams design if that ever changes.
 */

export interface ReceiveMessagePayload {
  _id: string;
  roomId: string;
  sender: string;
  content: string;
  timestamp: string | Date;
  isEdited: boolean;
}

export interface TypingStatusPayload {
  roomId: string;
  userId: string;
  isTyping: boolean;
}

export interface PresencePayload {
  socketId: string;
  userId: string;
  roomId: string;
}

/** Socket.IO event names emitted to clients. */
export const SOCKET_EMIT_EVENTS = {
  RECEIVE_MESSAGE: "receive_message",
  TYPING_STATUS: "typing_status",
  USER_JOINED: "user_joined",
  USER_LEFT: "user_left",
  MESSAGE_ERROR: "message_error",
} as const;

/** Socket.IO event names received from clients. */
export const SOCKET_LISTEN_EVENTS = {
  JOIN_ROOM: "join_room",
  LEAVE_ROOM: "leave_room",
  SEND_MESSAGE: "send_message",
  TYPING: "typing",
} as const;
