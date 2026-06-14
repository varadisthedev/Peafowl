/**
 * Shared OpenAPI response definitions.
 */

export const responses = {
  Unauthorized: {
    description: "Missing or invalid JWT token",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
        example: { message: "Access denied. Token missing." },
      },
    },
  },

  Forbidden: {
    description: "Authenticated but insufficient permissions",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
        example: { message: "Forbidden: Insufficient permissions." },
      },
    },
  },

  NotFound: {
    description: "Resource not found",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
        example: { message: "User not found" },
      },
    },
  },

  BadRequest: {
    description: "Invalid request body or parameters",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
      },
    },
  },

  ServerError: {
    description: "Internal server error",
    content: {
      "application/json": {
        schema: { $ref: "#/components/schemas/Error" },
        example: { message: "Server error" },
      },
    },
  },

  RateLimited: {
    description: "Too many requests (Redis sliding-window rate limiter)",
    content: {
      "application/json": {
        schema: {
          type: "object",
          properties: {
            message: { type: "string", example: "Too many requests, please try again later." },
          },
        },
      },
    },
  },
};
