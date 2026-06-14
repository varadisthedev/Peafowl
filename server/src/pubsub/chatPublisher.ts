/**
 * Chat event publisher.
 *
 * Publishes chat events to the Redis `peafowl:chat:events` channel.
 * Socket handlers call this instead of broadcasting directly, so every
 * server instance receives the event and fans it out to its local clients.
 */

import chalk from "chalk";
import { getRedisPubSubClients } from "./redisClients.ts";
import { CHAT_PUBSUB_CHANNEL, type ChatPubSubEvent } from "./types.ts";

const log = console.log;

export class ChatPublisher {
  /**
   * Serialize and publish a chat event to Redis.
   * Failures are logged but do not throw — chat should degrade gracefully
   * if Redis is temporarily unavailable.
   */
  async publish<T>(event: ChatPubSubEvent<T>): Promise<boolean> {
    try {
      const { publisher } = getRedisPubSubClients();
      const serialized = JSON.stringify(event);
      const receivers = await publisher.publish(CHAT_PUBSUB_CHANNEL, serialized);

      log(
        chalk.blue(
          `[ChatPublisher] ${event.type} → room:${event.roomId} (${receivers} subscriber(s))`,
        ),
      );
      return true;
    } catch (error) {
      log(chalk.red("[ChatPublisher] Failed to publish:"), error);
      return false;
    }
  }

  /** Convenience builder for receive_message events. */
  async publishMessage(
    roomId: string,
    payload: ChatPubSubEvent["payload"],
    originSocketId?: string,
  ): Promise<boolean> {
    return this.publish({
      type: "receive_message",
      roomId,
      payload,
      originSocketId,
      publishedAt: new Date().toISOString(),
    });
  }

  /** Convenience builder for typing_status events. */
  async publishTypingStatus(
    roomId: string,
    userId: string,
    isTyping: boolean,
    originSocketId: string,
  ): Promise<boolean> {
    return this.publish({
      type: "typing_status",
      roomId,
      payload: { roomId, userId, isTyping },
      originSocketId,
      publishedAt: new Date().toISOString(),
    });
  }

  /** Convenience builder for user_joined events. */
  async publishUserJoined(
    roomId: string,
    socketId: string,
    userId: string,
  ): Promise<boolean> {
    return this.publish({
      type: "user_joined",
      roomId,
      payload: { socketId, userId, roomId },
      originSocketId: socketId,
      publishedAt: new Date().toISOString(),
    });
  }

  /** Convenience builder for user_left events. */
  async publishUserLeft(
    roomId: string,
    socketId: string,
    userId: string,
  ): Promise<boolean> {
    return this.publish({
      type: "user_left",
      roomId,
      payload: { socketId, userId, roomId },
      originSocketId: socketId,
      publishedAt: new Date().toISOString(),
    });
  }
}

/** Singleton publisher instance used across the app. */
export const chatPublisher = new ChatPublisher();
