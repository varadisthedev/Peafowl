import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "http://localhost:3000";

let socket = null;

const withSocket = (fn) => {
  if (!socket) return;
  fn();
};

export const connectSocket = () => {
  if (socket) return socket;

  console.log("[Socket] Connecting to", SERVER_URL);
  socket = io(SERVER_URL, {
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("[Socket] Connected:", socket.id);
  });

  socket.on("disconnect", (reason) => {
    console.log("[Socket] Disconnected:", reason);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    console.log("[Socket] Disconnecting");
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const socketEvents = {
  // Join room
  joinRoom: (roomId, userId) => {
    console.log(
      `[Socket Event] Emit join_room: roomId=${roomId}, userId=${userId}`,
    );
    withSocket(() => socket.emit("join_room", { roomId, userId }));
  },

  // Leave room
  leaveRoom: (roomId, userId) => {
    console.log(
      `[Socket Event] Emit leave_room: roomId=${roomId}, userId=${userId}`,
    );
    withSocket(() => socket.emit("leave_room", { roomId, userId }));
  },

  // Send message
  sendMessage: (roomId, sender, content) => {
    console.log(
      `[Socket Event] Emit send_message: roomId=${roomId}, sender=${sender}, content="${content}"`,
    );
    withSocket(() => socket.emit("send_message", { roomId, sender, content }));
  },

  // Typing indicator
  sendTyping: (roomId, userId, isTyping) => {
    console.log(
      `[Socket Event] Emit typing: roomId=${roomId}, userId=${userId}, isTyping=${isTyping}`,
    );
    withSocket(() => socket.emit("typing", { roomId, userId, isTyping }));
  },

  // Listen for message received
  onReceiveMessage: (callback) => {
    console.log("[Socket Listener] Listening for receive_message");
    withSocket(() =>
      socket.on("receive_message", (msg) => {
        console.log("[Socket Event] Received receive_message:", msg);
        callback(msg);
      }),
    );
  },

  // Listen for user joined
  onUserJoined: (callback) => {
    console.log("[Socket Listener] Listening for user_joined");
    withSocket(() =>
      socket.on("user_joined", (data) => {
        console.log("[Socket Event] Received user_joined:", data);
        callback(data);
      }),
    );
  },

  // Listen for user left
  onUserLeft: (callback) => {
    console.log("[Socket Listener] Listening for user_left");
    withSocket(() =>
      socket.on("user_left", (data) => {
        console.log("[Socket Event] Received user_left:", data);
        callback(data);
      }),
    );
  },

  // Listen for typing
  onTyping: (callback) => {
    console.log("[Socket Listener] Listening for typing");
    withSocket(() =>
      socket.on("typing", (data) => {
        console.log("[Socket Event] Received typing:", data);
        callback(data);
      }),
    );
  },

  // Remove listener
  off: (event) => {
    console.log(`[Socket] Removing listener for ${event}`);
    withSocket(() => socket.off(event));
  },
};
