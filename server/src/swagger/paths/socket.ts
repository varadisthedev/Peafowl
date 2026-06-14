/**
 * Documentation-only paths for Socket.IO real-time events.
 * These are NOT HTTP endpoints — they appear in Swagger for API reference.
 */

export const socketPaths = {
  "/socket.io/events/join_room": {
    post: {
      tags: ["Socket.IO"],
      summary: "[Socket] join_room — Client → Server",
      description:
        "Join a chat room. Server adds the socket to the Socket.IO room and publishes a `user_joined` event via Redis pub/sub.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/SocketJoinRoomPayload" },
          },
        },
      },
      responses: {
        "200": {
          description: "N/A — WebSocket event (documented for reference)",
        },
      },
    },
  },

  "/socket.io/events/leave_room": {
    post: {
      tags: ["Socket.IO"],
      summary: "[Socket] leave_room — Client → Server",
      description:
        "Leave a chat room. Clears typing state and broadcasts `user_left` via Redis pub/sub.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/SocketJoinRoomPayload" },
          },
        },
      },
      responses: {
        "200": { description: "N/A — WebSocket event" },
      },
    },
  },

  "/socket.io/events/send_message": {
    post: {
      tags: ["Socket.IO"],
      summary: "[Socket] send_message — Client → Server",
      description:
        "Send a chat message. Persisted to MongoDB, then broadcast as `receive_message` through Redis pub/sub to all server instances.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/SocketSendMessagePayload" },
          },
        },
      },
      responses: {
        "200": { description: "N/A — WebSocket event" },
      },
    },
  },

  "/socket.io/events/typing": {
    post: {
      tags: ["Socket.IO"],
      summary: "[Socket] typing — Client → Server",
      description:
        "Emit typing status for a room. Server publishes `typing_status` to other clients in the room (not persisted).",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/SocketTypingPayload" },
          },
        },
      },
      responses: {
        "200": { description: "N/A — WebSocket event" },
      },
    },
  },

  "/socket.io/events/receive_message": {
    get: {
      tags: ["Socket.IO"],
      summary: "[Socket] receive_message — Server → Client",
      description: "Broadcast when a new message is saved and distributed to a room.",
      responses: {
        "200": {
          description: "Message payload",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SocketReceiveMessagePayload" },
            },
          },
        },
      },
    },
  },

  "/socket.io/events/typing_status": {
    get: {
      tags: ["Socket.IO"],
      summary: "[Socket] typing_status — Server → Client",
      description:
        "Typing indicator broadcast for a room. Includes `roomId` so clients can filter by active room. Excludes the sender.",
      responses: {
        "200": {
          description: "Typing status payload",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SocketTypingStatusPayload" },
            },
          },
        },
      },
    },
  },

  "/socket.io/events/user_joined": {
    get: {
      tags: ["Socket.IO"],
      summary: "[Socket] user_joined — Server → Client",
      description: "Broadcast when a user joins a room.",
      responses: {
        "200": {
          description: "Presence payload",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SocketPresencePayload" },
            },
          },
        },
      },
    },
  },

  "/socket.io/events/user_left": {
    get: {
      tags: ["Socket.IO"],
      summary: "[Socket] user_left — Server → Client",
      description: "Broadcast when a user leaves a room.",
      responses: {
        "200": {
          description: "Presence payload",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/SocketPresencePayload" },
            },
          },
        },
      },
    },
  },

  "/socket.io/events/message_error": {
    get: {
      tags: ["Socket.IO"],
      summary: "[Socket] message_error — Server → Client",
      description: "Sent to the sender when message persistence fails.",
      responses: {
        "200": {
          description: "Error payload",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  error: { type: "string", example: "Failed to save message" },
                },
              },
            },
          },
        },
      },
    },
  },
};
