import { responses } from "../../swagger/components/responses.ts";

export const userPaths = {
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
};
