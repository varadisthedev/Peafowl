import { useState, useEffect } from "react";
import { socketEvents, getSocket } from "../services/socket";
import { messageAPI } from "../services/api";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import RoomSelector from "../components/RoomSelector";
import UserList from "../components/UserList";
import TypingIndicator from "../components/TypingIndicator";

export default function Chat({ user, onLogout }) {
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);

  const socket = getSocket();

  // Setup socket listeners when room changes
  useEffect(() => {
    if (!roomId || !user) return;

    console.log("[Chat] Setting up listeners for room:", roomId);

    // Join room
    socketEvents.joinRoom(roomId, user.userId);

    // Listen for messages
    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };
    socketEvents.onReceiveMessage(handleReceiveMessage);

    // Listen for user joined
    const handleUserJoined = (data) => {
      console.log("[Chat] User joined:", data);
      setUsersInRoom((prev) => [...new Set([...prev, data.userId])]);
    };
    socketEvents.onUserJoined(handleUserJoined);

    // Listen for user left
    const handleUserLeft = (data) => {
      console.log("[Chat] User left:", data);
      setUsersInRoom((prev) => prev.filter((u) => u !== data.userId));
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[data.userId];
        return next;
      });
    };
    socketEvents.onUserLeft(handleUserLeft);

    // Listen for typing_status (room-scoped via Redis pub/sub)
    const handleTypingStatus = (data) => {
      if (data.roomId && data.roomId !== roomId) return;

      setTypingUsers((prev) => {
        const next = { ...prev };
        if (data.isTyping) {
          next[data.userId] = true;
        } else {
          delete next[data.userId];
        }
        return next;
      });
    };
    socketEvents.onTypingStatus(handleTypingStatus);

    // Fetch message history
    fetchMessageHistory();

    return () => {
      socketEvents.off("receive_message");
      socketEvents.off("user_joined");
      socketEvents.off("user_left");
      socketEvents.off("typing_status");
    };
  }, [roomId, user]);

  const fetchMessageHistory = async () => {
    if (!roomId) return;

    setLoading(true);
    console.log("[Chat] Fetching message history for room:", roomId);

    try {
      const res = await messageAPI.getMessagesByRoom(roomId, 50, 0);
      console.log("[Chat] Fetched messages:", res.data.messages);
      setMessages(res.data.messages);
    } catch (err) {
      console.error("[Chat] Error fetching messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (content) => {
    if (!roomId || !user) return;
    console.log("[Chat] Sending message:", content);
    socketEvents.sendMessage(roomId, user.username, content);
  };

  const handleTyping = (isTyping) => {
    if (!roomId || !user) return;
    socketEvents.sendTyping(roomId, user.userId, isTyping);
  };

  const handleDeleteMessage = async (messageId) => {
    console.log("[Chat] Deleting message:", messageId);
    try {
      await messageAPI.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      console.error("[Chat] Error deleting message:", err);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    console.log("[Chat] Editing message:", messageId, "->", newContent);
    try {
      const res = await messageAPI.editMessage(messageId, newContent);
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? res.data.message : m)),
      );
    } catch (err) {
      console.error("[Chat] Error editing message:", err);
    }
  };

  const handleLeaveRoom = () => {
    if (roomId && user) {
      console.log("[Chat] Leaving room:", roomId);
      socketEvents.leaveRoom(roomId, user.userId);
      setRoomId("");
      setMessages([]);
      setUsersInRoom([]);
      setTypingUsers({});
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          marginBottom: "20px",
          borderBottom: "1px solid #ccc",
          paddingBottom: "10px",
        }}
      >
        <h1>Peafowl Chat</h1>
        <p>
          Logged in as: <strong>{user.username}</strong> ({user.email})
        </p>
        <button onClick={onLogout}>[ACTION] Logout</button>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        {/* Left: Room Selector */}
        <div
          style={{
            flex: "0 0 20%",
            borderRight: "1px solid #ccc",
            paddingRight: "10px",
          }}
        >
          <RoomSelector onSelectRoom={setRoomId} currentRoomId={roomId} />
        </div>

        {/* Right: Chat Area */}
        {roomId ? (
          <div style={{ flex: "1" }}>
            <div
              style={{
                marginBottom: "20px",
                paddingBottom: "10px",
                borderBottom: "1px solid #ccc",
              }}
            >
              <h2>Room: {roomId}</h2>
              <button onClick={handleLeaveRoom}>[ACTION] Leave Room</button>
            </div>

            {/* Users in Room */}
            <UserList
              users={usersInRoom}
              typingUsers={typingUsers}
              currentUserId={user.userId}
            />

            {/* Messages */}
            {loading ? (
              <p>[STATUS] Loading messages...</p>
            ) : (
              <MessageList
                messages={messages}
                currentUser={user.username}
                onDeleteMessage={handleDeleteMessage}
                onEditMessage={handleEditMessage}
              />
            )}

            {/* Typing indicator */}
            <TypingIndicator
              typingUsers={typingUsers}
              currentUserId={user.userId}
            />

            {/* Message Input */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
            />
          </div>
        ) : (
          <div style={{ flex: "1" }}>
            <p>[INFO] Select a room to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
}
