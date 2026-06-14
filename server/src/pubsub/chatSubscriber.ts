/**
 * Chat event subscriber.
 *
 * Subscribes to the Redis chat channel and fans out events to local
 * Socket.IO clients. This is what enables horizontal scaling: any server
 * instance that receives a published event broadcasts it to sockets
 * connected to that instance.
 */

import type { Server as SocketServer } from "socket.io";
import chalk from "chalk";
import { getRedisPubSubClients } from "./redisClients.ts";
import {
  CHAT_PUBSUB_CHANNEL,
  SOCKET_EMIT_EVENTS,
  type ChatPubSubEvent,
} from "./types.ts";

const log = console.log;

/**
 * Parse and validate an incoming Redis message as a ChatPubSubEvent.
 */
function parseChatEvent(raw: string): ChatPubSubEvent | null {
  try {
    const parsed = JSON.parse(raw) as ChatPubSubEvent;
    if (!parsed?.type || !parsed?.roomId || !parsed?.payload) {
      log(chalk.yellow("[ChatSubscriber] Ignoring malformed event"));
      return null;
    }
    return parsed;
  } catch {
    log(chalk.yellow("[ChatSubscriber] Failed to parse event JSON"));
    return null;
  }
}

/**
 * Broadcast a parsed chat event to the appropriate Socket.IO room.
 */
function broadcastToRoom(io: SocketServer, event: ChatPubSubEvent): void {
  const { type, roomId, payload, originSocketId } = event;

  switch (type) {
    case "receive_message":
      io.to(roomId).emit(SOCKET_EMIT_EVENTS.RECEIVE_MESSAGE, payload);
      break;

    case "typing_status":
      // Exclude the sender — they already know they're typing
      if (originSocketId) {
        io.to(roomId).except(originSocketId).emit(SOCKET_EMIT_EVENTS.TYPING_STATUS, payload);
      } else {
        io.to(roomId).emit(SOCKET_EMIT_EVENTS.TYPING_STATUS, payload);
      }
      break;

    case "user_joined":
      io.to(roomId).emit(SOCKET_EMIT_EVENTS.USER_JOINED, payload);
      break;

    case "user_left":
      io.to(roomId).emit(SOCKET_EMIT_EVENTS.USER_LEFT, payload);
      break;

    default:
      log(chalk.yellow(`[ChatSubscriber] Unknown event type: ${type}`));
  }
}

let isSubscribed = false;

/**
 * Subscribe to the Redis chat channel and wire broadcasts to Socket.IO.
 * Safe to call once at server startup. If Redis is unavailable the server
 * still starts — socket handlers fall back to direct local broadcasts.
 */
export async function initChatSubscriber(io: SocketServer): Promise<boolean> {
  if (isSubscribed) {
    log(chalk.yellow("[ChatSubscriber] Already subscribed, skipping"));
    return true;
  }

  try {
    const { subscriber } = getRedisPubSubClients();

    subscriber.on("message", (channel, message) => {
      if (channel !== CHAT_PUBSUB_CHANNEL) return;

      const event = parseChatEvent(message);
      if (!event) return;

      broadcastToRoom(io, event);
    });

    await subscriber.subscribe(CHAT_PUBSUB_CHANNEL);
    isSubscribed = true;
    log(
      chalk.green(
        `[ChatSubscriber] Listening on channel "${CHAT_PUBSUB_CHANNEL}"`,
      ),
    );
    return true;
  } catch (error) {
    log(
      chalk.yellow(
        "[ChatSubscriber] Could not subscribe to Redis — chat will use local socket fallback:",
      ),
      error instanceof Error ? error.message : error,
    );
    return false;
  }
}
