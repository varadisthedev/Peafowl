import express from "express";
import cors from "cors";
import { env } from "./config/env.ts";
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
const app = express();
const PORT = env.PORT;
const log = console.log;

// to allow express to trust the proxy (like nginx, railway ,render)
app.set("trust proxy", true);


const server = http.createServer(app); // wrapping express app in http server for Socket.io
const io = new Server(server, {
  cors: {
    origin: env.CLIENT_URL,
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

app.use(
  cors({
    origin: env.CLIENT_URL,
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
  if (env.NODE_ENV === "development") {

    log(chalk.blue(`[Server: DEV] running on: http://localhost:${PORT}/`));
    log(chalk.blue(`[Server: DEV] API docs: http://localhost:${PORT}/api-docs`));
  } else {
    log(chalk.blue(`[Server: PROD] production on port ${PORT}`));
  }
});
