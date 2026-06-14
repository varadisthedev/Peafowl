import { responses } from "../components/responses.ts";

export const userPaths = {
  "/api/users/register": {
    post: {
      tags: ["Users"],
      summary: "Register a new user",
      description:
        "Creates a new user account with hashed password. Username and email must be unique.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/RegisterRequest" },
          },
        },
      },
      responses: {
        "201": {
          description: "User created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "User registered successfully" },
                  user: { $ref: "#/components/schemas/UserPublic" },
                },
              },
            },
          },
        },
        "400": responses.BadRequest,
        "409": {
          description: "Duplicate username or email",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "500": responses.ServerError,
      },
    },
  },

  "/api/users/login": {
    post: {
      tags: ["Users"],
      summary: "Login",
      description:
        "Authenticates with email/password. Returns JWT and sets an httpOnly `token` cookie (1h expiry).",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/LoginRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Login successful",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginResponse" },
            },
          },
        },
        "400": responses.BadRequest,
        "500": responses.ServerError,
      },
    },
  },

  "/api/users/profile": {
    get: {
      tags: ["Users"],
      summary: "Get current user profile",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      responses: {
        "200": {
          description: "Profile retrieved",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
        "401": responses.Unauthorized,
        "404": responses.NotFound,
        "500": responses.ServerError,
      },
    },
  },

  "/api/users/mailUpdate": {
    put: {
      tags: ["Users"],
      summary: "Update email address",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateMailRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Email updated",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/User" },
            },
          },
        },
        "400": responses.BadRequest,
        "401": responses.Unauthorized,
        "404": responses.NotFound,
        "500": responses.ServerError,
      },
    },
  },

  "/api/users/testRateLimit": {
    get: {
      tags: ["Users"],
      summary: "Rate limit test endpoint",
      description:
        "Public endpoint for verifying the Redis sliding-window rate limiter (`100 req / 15 min` per IP on `/api/*`).",
      responses: {
        "200": {
          description: "Request allowed",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Rate limit test successful" },
                },
              },
            },
          },
        },
        "429": responses.RateLimited,
      },
    },
  },
};
