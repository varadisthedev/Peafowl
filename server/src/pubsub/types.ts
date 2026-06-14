/**
 * Chat pub/sub event types and payloads.
 *
 * All chat real-time events flow through Redis on a single channel.
 * Each message is a JSON-serialized ChatPubSubEvent.
 */

export const CHAT_PUBSUB_CHANNEL = "peafowl:chat:events";

/** Discriminated union of every chat event that can be published. */
export type ChatEventType =
  | "receive_message"
  | "typing_status"
  | "user_joined"
  | "user_left";

export interface ChatPubSubEvent<T = unknown> {
  /** Event kind — maps to the Socket.IO emit name on the client. */
  type: ChatEventType;
  /** Target chat room. */
  roomId: string;
  /** Event-specific payload broadcast to clients. */
  payload: T;
  /**
   * Socket ID of the originating client.
   * Used to exclude the sender from typing_status broadcasts.
   */
  originSocketId?: string;
  /** ISO timestamp when the event was published. */
  publishedAt: string;
}

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

/** Socket.IO event names emitted to clients (mirrors ChatEventType). */
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
