import { responses } from "../../swagger/components/responses.ts";

export const authPaths = {
  "/api/users/register/send-otp": {
    post: {
      tags: ["Users"],
      summary: "Send OTP for registration (Step 1)",
      description:
        "Validates inputs, stores the pending user registration data in Redis, and sends a verification OTP to the user's email.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/SendOtpRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "OTP sent successfully",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "OTP sent to your email. Please verify to complete registration." },
                },
              },
            },
          },
        },
        "400": responses.BadRequest,
        "409": {
          description: "Email or Username already exists",
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

  "/api/users/register/verify-otp": {
    post: {
      tags: ["Users"],
      summary: "Verify OTP and complete registration (Step 2)",
      description:
        "Verifies the submitted OTP against Redis. On success, creates the user account in Postgres database.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/VerifyOtpRequest" },
          },
        },
      },
      responses: {
        "201": {
          description: "User registered successfully",
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
        "400": {
          description: "Invalid/expired OTP or session",
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/Error" },
            },
          },
        },
        "409": {
          description: "Duplicate username or email (race condition guard)",
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

  "/api/users/logout": {
    post: {
      tags: ["Users"],
      summary: "Logout",
      description: "Clears the httpOnly `token` auth cookie.",
      responses: {
        "200": {
          description: "Logged out",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "Logged out successfully" },
                },
              },
            },
          },
        },
        "500": responses.ServerError,
      },
    },
  },
};
