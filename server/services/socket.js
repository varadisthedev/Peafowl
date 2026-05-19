export default function setupSocket(io) {
  io.on("connection", (socket) => {
    console.log("[Socket] connected:", socket.id);

    socket.on("join_room", ({ roomId, userId }) => {
      if (!roomId) return;
      socket.join(roomId);
      io.to(roomId).emit("user_joined", { socketId: socket.id, userId });
    });

    socket.on("leave_room", ({ roomId, userId }) => {
      if (!roomId) return;
      socket.leave(roomId);
      io.to(roomId).emit("user_left", { socketId: socket.id, userId });
    });

    socket.on("send_message", (msg) => {
      // msg expected: { roomId, sender, content, ... }
      if (!msg || !msg.roomId) return;
      msg.timestamp = new Date().toISOString();
      io.to(msg.roomId).emit("receive_message", msg);
    });

    socket.on("typing", ({ roomId, userId, isTyping }) => {
      if (!roomId) return;
      socket.to(roomId).emit("typing", { userId, isTyping });
    });

    socket.on("disconnect", (reason) => {
      console.log("[Socket] disconnected:", socket.id, reason);
    });
  });
}
