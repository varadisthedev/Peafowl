import { responses } from "../components/responses.ts";

export const messagePaths = {
  "/api/messages/room/{roomId}": {
    get: {
      tags: ["Messages"],
      summary: "Get messages by room",
      description:
        "Returns paginated message history for a chat room, oldest-first in the response array.",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "roomId",
          in: "path",
          required: true,
          schema: { type: "string" },
          example: "general",
          description: "Chat room identifier",
        },
        {
          name: "limit",
          in: "query",
          schema: { type: "integer", default: 50, minimum: 1, maximum: 200 },
          description: "Max messages to return",
        },
        {
          name: "skip",
          in: "query",
          schema: { type: "integer", default: 0, minimum: 0 },
          description: "Number of messages to skip (pagination offset)",
        },
      ],
      responses: {
        "200": {
          description: "Message history",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/MessagesByRoomResponse" },
            },
          },
        },
        "401": responses.Unauthorized,
        "500": responses.ServerError,
      },
    },
  },

  "/api/messages/{messageId}": {
    put: {
      tags: ["Messages"],
      summary: "Edit a message",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "messageId",
          in: "path",
          required: true,
          schema: { type: "string" },
          description: "MongoDB message ObjectId",
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/EditMessageRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Message updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { $ref: "#/components/schemas/Message" },
                },
              },
            },
          },
        },
        "400": responses.BadRequest,
        "401": responses.Unauthorized,
        "404": responses.NotFound,
        "500": responses.ServerError,
      },
    },
    delete: {
      tags: ["Messages"],
      summary: "Delete a message",
      description: "Only the message owner may delete their message.",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "messageId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "Message deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string", example: "Message deleted successfully" },
                },
              },
            },
          },
        },
        "401": responses.Unauthorized,
        "403": responses.Forbidden,
        "404": responses.NotFound,
        "500": responses.ServerError,
      },
    },
  },

  "/api/messages/{messageId}/pin": {
    patch: {
      tags: ["Messages"],
      summary: "Pin a message",
      description: "Only the message owner may pin their message.",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "messageId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        "200": {
          description: "Message pinned",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                  pinnedMessage: { $ref: "#/components/schemas/Message" },
                },
              },
            },
          },
        },
        "401": responses.Unauthorized,
        "403": responses.Forbidden,
        "404": responses.NotFound,
        "500": responses.ServerError,
      },
    },
  },
};
