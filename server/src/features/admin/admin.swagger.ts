import { responses } from "../../swagger/components/responses.ts";

export const adminPaths = {
  "/api/admin/createAccount": {
    post: {
      tags: ["Admin"],
      summary: "Create admin account",
      description:
        "Creates a user with `admin` role. Requires an existing admin's JWT — the first admin is bootstrapped via `npm run db:seed-admin`, not this route.",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/CreateAdminRequest" },
          },
        },
      },
      responses: {
        "201": {
          description: "Admin created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
                  email: { type: "string", format: "email" },
                },
              },
            },
          },
        },
        "400": responses.BadRequest,
        "401": responses.Unauthorized,
        "403": responses.Forbidden,
        "500": responses.ServerError,
      },
    },
  },

  "/api/admin/users": {
    get: {
      tags: ["Admin"],
      summary: "List all users",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      responses: {
        "200": {
          description: "Array of users (username + email)",
          content: {
            "application/json": {
              schema: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    username: { type: "string" },
                    email: { type: "string", format: "email" },
                  },
                },
              },
            },
          },
        },
        "401": responses.Unauthorized,
        "403": responses.Forbidden,
        "500": responses.ServerError,
      },
    },
  },

  "/api/admin/users/{id}": {
    get: {
      tags: ["Admin"],
      summary: "Get user by ID",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
          description: "Numeric user id",
        },
      ],
      responses: {
        "200": {
          description: "User details",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  email: { type: "string" },
                  role: { $ref: "#/components/schemas/UserRole" },
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
    delete: {
      tags: ["Admin"],
      summary: "Delete user by ID",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      responses: {
        "200": {
          description: "User deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string", example: "User deleted successfully" },
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

  "/api/admin/users/{id}/role": {
    put: {
      tags: ["Admin"],
      summary: "Update user role (PUT)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateRoleRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Role updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
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
    patch: {
      tags: ["Admin"],
      summary: "Update user role (PATCH)",
      security: [{ bearerAuth: [] }, { cookieAuth: [] }],
      parameters: [
        {
          name: "id",
          in: "path",
          required: true,
          schema: { type: "integer" },
        },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/UpdateRoleRequest" },
          },
        },
      },
      responses: {
        "200": {
          description: "Role updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  message: { type: "string" },
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
