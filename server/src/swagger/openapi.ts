import { schemas } from "./components/schemas.ts";
import { responses } from "./components/responses.ts";
import { securitySchemes } from "./components/security.ts";
import { authPaths } from "../features/auth/auth.swagger.ts";
import { userPaths } from "../features/users/users.swagger.ts";
import { messagePaths } from "../features/messages/messages.swagger.ts";
import { adminPaths } from "../features/admin/admin.swagger.ts";
import { socketPaths } from "../features/chat/chat.swagger.ts";

/**
 * Assembled OpenAPI 3.0 specification for the Peafowl API.
 * Modular path and schema files are merged here.
 */
export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Peafowl API",
    version: "1.0.0",
    description: `
Real-time chat application API built with **Express 5**, **Socket.IO**, **PostgreSQL** (via Prisma), and **Redis**.

## Authentication
- Register or login to receive a JWT.
- Pass the token via \`Authorization: Bearer <token>\` header **or** the httpOnly \`token\` cookie.
- Protected routes return \`401\` when the token is missing or invalid.
- Admin routes additionally require \`role: admin\`.

## Rate Limiting
All \`/api/*\` routes are rate-limited via Redis sliding-window: **100 requests per 15 minutes** per IP.

## Real-time Chat (Socket.IO)
Connect to the same origin as the HTTP server (default \`http://localhost:3000\`).

Chat events are broadcast directly to Socket.IO rooms on the single server
instance — no message bus involved. See \`server/docs/chat-scaling.md\` for the
reasoning and the documented path to a Redis Streams-based fanout if the app
ever needs to run multiple server instances.

| Direction | Event | Description |
|-----------|-------|-------------|
| C→S | \`join_room\` | Join a room |
| C→S | \`leave_room\` | Leave a room |
| C→S | \`send_message\` | Send message (saved to Postgres) |
| C→S | \`typing\` | Emit typing on/off for a room |
| S→C | \`receive_message\` | New message broadcast |
| S→C | \`typing_status\` | Typing indicator for room members |
| S→C | \`user_joined\` | User joined room |
| S→C | \`user_left\` | User left room |
| S→C | \`message_error\` | Message save failed |

See the **Socket.IO** tag below for detailed payload schemas.
    `.trim(),
    contact: {
      name: "Peafowl",
    },
  },
  servers: [
    {
      url: "http://localhost:3000",
      description: "Local development",
    },
  ],
  tags: [
    {
      name: "Root",
      description: "Health / welcome endpoints",
    },
    {
      name: "Users",
      description: "Registration, login, and profile management",
    },
    {
      name: "Messages",
      description: "REST endpoints for message history, edit, delete, and pin",
    },
    {
      name: "Admin",
      description: "Admin-only user management (requires JWT + admin role)",
    },
    {
      name: "Socket.IO",
      description:
        "Real-time WebSocket events (documented paths are reference-only, not HTTP routes)",
    },
  ],
  paths: {
    "/": {
      get: {
        tags: ["Root"],
        summary: "API welcome",
        responses: {
          "200": {
            description: "Welcome message",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/SuccessResponse" },
                example: { success: true, message: "Welcome to the Peafowl API" },
              },
            },
          },
        },
      },
    },
    ...authPaths,
    ...userPaths,
    ...messagePaths,
    ...adminPaths,
    ...socketPaths,
  },
  components: {
    schemas,
    responses,
    securitySchemes,
  },
};
