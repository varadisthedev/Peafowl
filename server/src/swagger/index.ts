import type { Express } from "express";
import swaggerUi from "swagger-ui-express";
import { openApiSpec } from "./openapi.ts";

/**
 * Mount Swagger UI and the raw OpenAPI JSON spec on the Express app.
 *
 * - GET /api-docs       → Interactive Swagger UI
 * - GET /api-docs.json  → Raw OpenAPI 3.0 spec (for codegen, Postman import, etc.)
 */
export function setupSwagger(app: Express): void {
  app.get("/api-docs.json", (_req, res) => {
    res.json(openApiSpec);
  });

  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(openApiSpec, {
      customSiteTitle: "Peafowl API Docs",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: "list",
        filter: true,
        tryItOutEnabled: true,
      },
    }),
  );
}

export { openApiSpec };
