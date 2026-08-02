import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectPrisma } from "./config/prisma.ts";
import cookieParser from "cookie-parser";
import chalk from "chalk";
import http from "http";
import { Server } from "socket.io";

import router from "./routes/index.ts";
import setupSocket from "./features/chat/chat.gateway.ts";
import { setupSwagger } from "./swagger/index.ts";

// adding redis rate limit
import RedisRateLimiter from "./middleware/rateLimiter.ts";
import { logger } from "./middleware/requestLogger.ts";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
const log = console.log;

// to allow express to trust the proxy (like nginx, railway ,render)
app.set("trust proxy", true);


const server = http.createServer(app); // wrapping express app in http server for Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
  },
});

// Connect to db
await connectPrisma();

// middlware
app.use(logger);
app.use(express.json());
app.set("trust proxy", true);
const apiLimiter = RedisRateLimiter({ windowMs: 15 * 60 * 1000, max: 100 });
app.use("/api", apiLimiter);

if (!process.env.CLIENT_URL || process.env.CLIENT_URL.endsWith("/")) {
  throw new Error("add CLIENT_URL in env without the trailing slash")
}
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  }),
);
app.use(cookieParser());

// API documentation (Swagger UI at /api-docs)
setupSwagger(app);

// routes
app.use(router);

// initialize socket handlers — chat events broadcast directly via Socket.IO,
// no message bus involved (see server/docs/chat-scaling.md)
setupSocket(io);

// start server (using http server so Socket.IO attaches correctly)
server.listen(PORT, () => {
  console.clear();
  console.log("=================================");
  if (process.env.NODE_ENV === "development") {

    log(chalk.blue(`[Server: DEV] running on: http://localhost:${PORT}/`));
    log(chalk.blue(`[Server: DEV] API docs: http://localhost:${PORT}/api-docs`));
  } else {
    log(chalk.blue(`[Server: PROD] production on port ${PORT}`));
  }
});
