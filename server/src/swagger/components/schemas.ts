/**
 * Reusable OpenAPI component schemas for the Peafowl API.
 * Import these into path definitions to keep documentation DRY.
 */

export const schemas = {
  Error: {
    type: "object",
    properties: {
      message: { type: "string", example: "Something went wrong" },
      err: { type: "string", description: "Detailed error (dev/debug)" },
    },
    required: ["message"],
  },

  SuccessResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      message: { type: "string" },
    },
    required: ["success", "message"],
  },

  UserRole: {
    type: "string",
    enum: ["user", "admin"],
    example: "user",
  },

  UserStatus: {
    type: "string",
    enum: ["online", "offline", "away", "busy", "invisible"],
    example: "offline",
  },

  User: {
    type: "object",
    properties: {
      _id: { type: "string", example: "665f1a2b3c4d5e6f7a8b9c0d" },
      username: { type: "string", minLength: 3, maxLength: 30, example: "peafowl_user" },
      email: { type: "string", format: "email", example: "user@example.com" },
      role: { $ref: "#/components/schemas/UserRole" },
      contactNumber: { type: "string", example: "" },
      avatar: { type: "string", example: "" },
      bio: { type: "string", example: "" },
      lastSeen: { type: "string", format: "date-time" },
      status: { $ref: "#/components/schemas/UserStatus" },
      accountRep: { type: "number", example: 1000 },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  UserPublic: {
    type: "object",
    properties: {
      id: { type: "string", example: "665f1a2b3c4d5e6f7a8b9c0d" },
      username: { type: "string", example: "peafowl_user" },
      email: { type: "string", format: "email", example: "user@example.com" },
      role: { $ref: "#/components/schemas/UserRole" },
    },
  },

  RegisterRequest: {
    type: "object",
    required: ["username", "email", "password"],
    properties: {
      username: { type: "string", minLength: 3, maxLength: 30, example: "peafowl_user" },
      email: { type: "string", format: "email", example: "user@example.com" },
      password: { type: "string", format: "password", minLength: 6, example: "securePass123" },
    },
  },

  SendOtpRequest: {
    type: "object",
    required: ["username", "email", "password"],
    properties: {
      username: { type: "string", minLength: 3, maxLength: 30, example: "peafowl_user" },
      email: { type: "string", format: "email", example: "user@example.com" },
      password: { type: "string", format: "password", minLength: 6, example: "securePass123" },
    },
  },

  VerifyOtpRequest: {
    type: "object",
    required: ["email", "otp"],
    properties: {
      email: { type: "string", format: "email", example: "user@example.com" },
      otp: { type: "string", minLength: 6, maxLength: 6, example: "123456" },
    },
  },

  LoginRequest: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "user@example.com" },
      password: { type: "string", format: "password", example: "securePass123" },
    },
  },

  LoginResponse: {
    type: "object",
    properties: {
      message: { type: "string", example: "Login successful" },
      token: {
        type: "string",
        description: "JWT bearer token (also set as httpOnly cookie `token`)",
        example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      },
    },
  },

  UpdateMailRequest: {
    type: "object",
    required: ["currentMail", "newMail"],
    properties: {
      currentMail: { type: "string", format: "email", example: "old@example.com" },
      newMail: { type: "string", format: "email", example: "new@example.com" },
    },
  },

  Message: {
    type: "object",
    properties: {
      _id: { type: "string", example: "665f1a2b3c4d5e6f7a8b9c0e" },
      roomId: { type: "string", example: "general" },
      sender: {
        type: "string",
        description: "MongoDB ObjectId of the sender",
        example: "665f1a2b3c4d5e6f7a8b9c0d",
      },
      content: { type: "string", example: "Hello, Peafowl!" },
      timestamp: { type: "string", format: "date-time" },
      isEdited: { type: "boolean", default: false },
      isPinned: { type: "boolean", default: false },
      pinnedAt: { type: "string", format: "date-time", nullable: true },
      editedAt: { type: "string", format: "date-time", nullable: true },
      createdAt: { type: "string", format: "date-time" },
      updatedAt: { type: "string", format: "date-time" },
    },
  },

  EditMessageRequest: {
    type: "object",
    required: ["content"],
    properties: {
      content: { type: "string", example: "Updated message content" },
    },
  },

  MessagesByRoomResponse: {
    type: "object",
    properties: {
      success: { type: "boolean", example: true },
      messages: {
        type: "array",
        items: { $ref: "#/components/schemas/Message" },
      },
      totalCount: { type: "integer", example: 42 },
    },
  },

  UpdateRoleRequest: {
    type: "object",
    required: ["role"],
    properties: {
      role: { $ref: "#/components/schemas/UserRole" },
    },
  },

  CreateAdminRequest: {
    type: "object",
    required: ["username", "email", "password"],
    properties: {
      username: { type: "string", example: "admin_user" },
      email: { type: "string", format: "email", example: "admin@example.com" },
      password: { type: "string", format: "password", example: "adminPass123" },
    },
  },

  // --- Socket.IO event payload schemas (documentation only) ---

  SocketJoinRoomPayload: {
    type: "object",
    required: ["roomId", "userId"],
    properties: {
      roomId: { type: "string", example: "general" },
      userId: { type: "string", description: "Display name or user identifier", example: "peafowl_user" },
    },
  },

  SocketSendMessagePayload: {
    type: "object",
    required: ["roomId", "sender", "content"],
    properties: {
      roomId: { type: "string", example: "general" },
      sender: { type: "string", description: "Sender identifier (username or ObjectId)", example: "peafowl_user" },
      content: { type: "string", example: "Hello room!" },
    },
  },

  SocketTypingPayload: {
    type: "object",
    required: ["roomId", "userId", "isTyping"],
    properties: {
      roomId: { type: "string", example: "general" },
      userId: { type: "string", example: "peafowl_user" },
      isTyping: { type: "boolean", example: true },
    },
  },

  SocketTypingStatusPayload: {
    type: "object",
    required: ["roomId", "userId", "isTyping"],
    properties: {
      roomId: { type: "string", example: "general" },
      userId: { type: "string", example: "peafowl_user" },
      isTyping: { type: "boolean", example: true },
    },
  },

  SocketReceiveMessagePayload: {
    type: "object",
    properties: {
      _id: { type: "string" },
      roomId: { type: "string" },
      sender: { type: "string" },
      content: { type: "string" },
      timestamp: { type: "string", format: "date-time" },
      isEdited: { type: "boolean" },
    },
  },

  SocketPresencePayload: {
    type: "object",
    properties: {
      socketId: { type: "string", example: "abc123socket" },
      userId: { type: "string", example: "peafowl_user" },
      roomId: { type: "string", example: "general" },
    },
  },
};
