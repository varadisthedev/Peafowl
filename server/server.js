import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectMongo from "./config/connectToMongoDB.js";
import cookieParser from "cookie-parser";
import chalk from "chalk";
import http from "http";
import { Server } from "socket.io";

import router from "./routes/index.js";
import setupSocket from "./services/socket.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;
console = console; // for chalk logging
const log = console.log;

const server = http.createServer(app); // wrapping express app in http server for Socket.io
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  },
});

// Connect to db
connectMongo();

// middlware
app.use(express.json());
// CORS setup
// app.use(
//   cors({
//     origin: process.env.CLIENT_URL || "http://localhost:5173",
//     credentials: true,
//   }),
// );

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(cookieParser());

// routes
app.use(router);

// initialize socket handlers
setupSocket(io);

// start server (using http server so Socket.IO attaches correctly)
server.listen(PORT, () => {
  console.clear();
  console.log("=================================");
  if (process.env.NODE_ENV === "development") {
    log(chalk.blue(`[Server: DEV] running on: http://localhost:${PORT}/`));
  } else {
    log(chalk.blue(`[Server: PROD] production on port ${PORT}`));
  }
});
