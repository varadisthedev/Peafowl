/**
 * Peafowl chat pub/sub module.
 *
 * Architecture
 * ------------
 * ```
 *  Client A ──socket──► Server 1 ──publish──► Redis (peafowl:chat:events)
 *                                              │
 *  Client B ──socket──► Server 2 ◄─subscribe───┘
 *                         │
 *                         └──emit──► Client B
 * ```
 *
 * Socket handlers publish events instead of calling `io.to().emit()` directly.
 * Every server instance (including the publisher) subscribes and broadcasts
 * to its local Socket.IO clients, enabling multi-instance deployments.
 *
 * Usage
 * -----
 * ```ts
 * import { chatPublisher, initChatSubscriber } from "./pubsub";
 *
 * // At startup (after creating io):
 * await initChatSubscriber(io);
 *
 * // In a socket handler:
 * await chatPublisher.publishMessage(roomId, savedMessage, socket.id);
 * ```
 */

export { chatPublisher, ChatPublisher } from "./chatPublisher.ts";
export { initChatSubscriber } from "./chatSubscriber.ts";
export { getRedisPubSubClients, disconnectRedisPubSub } from "./redisClients.ts";
export {
  CHAT_PUBSUB_CHANNEL,
  SOCKET_EMIT_EVENTS,
  SOCKET_LISTEN_EVENTS,
  type ChatPubSubEvent,
  type ChatEventType,
  type ReceiveMessagePayload,
  type TypingStatusPayload,
  type PresencePayload,
} from "./types.ts";
