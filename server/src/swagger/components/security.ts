/**
 * OpenAPI security scheme definitions.
 */

export const securitySchemes = {
  bearerAuth: {
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description:
      "JWT issued on login. Pass as `Authorization: Bearer <token>` or rely on the httpOnly `token` cookie.",
  },

  cookieAuth: {
    type: "apiKey",
    in: "cookie",
    name: "token",
    description: "httpOnly cookie set automatically on login/register.",
  },
};

export const defaultSecurity = [{ bearerAuth: [] }, { cookieAuth: [] }];
