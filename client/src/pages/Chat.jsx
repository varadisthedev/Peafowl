import { useState, useEffect, useRef } from "react";
import { socketEvents, getSocket } from "../services/socket";
import { messageAPI } from "../services/api";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import RoomSelector from "../components/RoomSelector";
import UserList from "../components/UserList";
import TypingIndicator from "../components/TypingIndicator";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { LogOut, Hash, Users, MessageSquare } from "lucide-react";

/**
 * Chat Page Component
 * The main interface for the peafowl chat application.
 * Features a sleek 3-column layout with rooms, messages, and active users.
 */
export default function Chat({ user, onLogout }) {
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);
  
  const socket = getSocket();

  // Handle room changes and socket events
  useEffect(() => {
    if (!roomId || !user) return;

    console.log(`[Chat] Transitioning to room: ${roomId}`);

    // Step 1: Join the socket room
    socketEvents.joinRoom(roomId, user.userId, user.username);

    // Step 2: Set up real-time event listeners
    const handleReceiveMessage = (msg) => {
      console.log("[Chat] New message received via socket");
      setMessages((prev) => [...prev, msg]);
    };
    
    const handleUserJoined = (data) => {
      console.log(`[Chat] User ${data.username || data.userId} entered the room`);
      setUsersInRoom((prev) => {
        if (prev.some((u) => (u && typeof u === "object" ? u.userId : u) === data.userId)) return prev;
        return [...prev, { userId: data.userId, username: data.username || data.userId }];
      });
    };

    const handleUserLeft = (data) => {
      console.log(`[Chat] User ${data.userId} left the room`);
      setUsersInRoom((prev) => prev.filter((u) => (u && typeof u === "object" ? u.userId : u) !== data.userId));
      setTypingUsers((prev) => {
        const next = { ...prev };
        delete next[data.userId];
        return next;
      });
    };

    const handleTypingStatus = (data) => {
      // Ensure the typing event is for the current room
      if (data.roomId && data.roomId !== roomId) return;

      setTypingUsers((prev) => {
        const next = { ...prev };
        if (data.isTyping) {
          next[data.userId] = data.username || data.userId;
        } else {
          delete next[data.userId];
        }
        return next;
      });
    };

    socketEvents.onReceiveMessage(handleReceiveMessage);
    socketEvents.onUserJoined(handleUserJoined);
    socketEvents.onUserLeft(handleUserLeft);
    socketEvents.onTypingStatus(handleTypingStatus);

    // Step 3: Load historical messages
    fetchMessageHistory();

    // Cleanup listeners on room change or unmount
    return () => {
      console.log(`[Chat] Cleaning up listeners for room: ${roomId}`);
      socketEvents.off("receive_message");
      socketEvents.off("user_joined");
      socketEvents.off("user_left");
      socketEvents.off("typing_status");
    };
  }, [roomId, user]);

  /**
   * Fetches message history for the current room from the REST API.
   */
  const fetchMessageHistory = async () => {
    if (!roomId) return;

    setLoading(true);
    console.log(`[Chat] API Request: GET /api/messages/room/${roomId}`);

    try {
      const res = await messageAPI.getMessagesByRoom(roomId, 50, 0);
      console.log(`[Chat] Successfully loaded ${res.data.messages.length} messages`);
      setMessages(res.data.messages);
    } catch (err) {
      console.error("[Chat] Failed to fetch message history:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (content) => {
    if (!roomId || !user) return;
    console.log("[Chat] Emitting 'send_message' via socket");
    socketEvents.sendMessage(roomId, user.userId, content);
  };

  const handleTyping = (isTyping) => {
    if (!roomId || !user) return;
    socketEvents.sendTyping(roomId, user.userId, isTyping, user.username);
  };

  const handleDeleteMessage = async (messageId) => {
    console.log(`[Chat] API Request: DELETE /api/messages/${messageId}`);
    try {
      await messageAPI.deleteMessage(messageId);
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
    } catch (err) {
      console.error("[Chat] Failed to delete message:", err);
    }
  };

  const handleEditMessage = async (messageId, newContent) => {
    console.log(`[Chat] API Request: PATCH /api/messages/${messageId}`);
    try {
      const res = await messageAPI.editMessage(messageId, newContent);
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? res.data.message : m)),
      );
    } catch (err) {
      console.error("[Chat] Failed to edit message:", err);
    }
  };

  const handleLeaveRoom = () => {
    if (roomId && user) {
      console.log(`[Chat] Explicitly leaving room: ${roomId}`);
      socketEvents.leaveRoom(roomId, user.userId, user.username);
      setRoomId("");
      setMessages([]);
      setUsersInRoom([]);
      setTypingUsers({});
    }
  };

  return (
    <div className="flex h-screen w-full flex-col bg-background text-foreground dark">
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between border-b border-border px-6 bg-card">
        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
            <span className="text-[10px] font-bold text-primary-foreground">PF</span>
          </div>
          <h1 className="text-sm font-bold tracking-widest uppercase">Peafowl</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-xs font-medium">{user.username}</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-tighter">{user.email}</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onLogout} 
            className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden p-2 gap-2">
        {/* Left Sidebar: Room Selector */}
        <Card className="hidden w-64 flex-col border-border bg-card md:flex">
          <div className="flex items-center gap-2 border-b border-border p-4">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-xs font-semibold uppercase tracking-wider">Channels</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <RoomSelector onSelectRoom={setRoomId} currentRoomId={roomId} />
          </div>
        </Card>

        {/* Center: Message Area */}
        <Card className="flex flex-1 flex-col border-border bg-card relative overflow-hidden">
          {roomId ? (
            <>
              {/* Room Header */}
              <div className="flex items-center justify-between border-b border-border p-4 bg-muted/30">
                <div className="flex items-center gap-2">
                  <div className="bg-foreground text-background text-[10px] px-1.5 py-0.5 font-bold rounded">#{roomId.toUpperCase()}</div>
                  <h3 className="text-sm font-medium">Channel Feed</h3>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLeaveRoom}
                  className="h-7 text-[10px] uppercase font-bold tracking-tight"
                >
                  Leave Channel
                </Button>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-hidden relative">
                {loading ? (
                  <div className="flex h-full items-center justify-center">
                    <p className="animate-pulse text-xs uppercase tracking-widest text-muted-foreground">Syncing Messages...</p>
                  </div>
                ) : (
                  <MessageList
                    messages={messages}
                    currentUser={user.username}
                    onDeleteMessage={handleDeleteMessage}
                    onEditMessage={handleEditMessage}
                  />
                )}
              </div>

              {/* Bottom Area: Input & Typing */}
              <div className="border-t border-border p-4 bg-muted/10">
                <TypingIndicator
                  typingUsers={typingUsers}
                  currentUserId={user.userId}
                />
                <MessageInput
                  onSendMessage={handleSendMessage}
                  onTyping={handleTyping}
                />
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-muted p-4">
                <MessageSquare className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold tracking-tight uppercase">No Channel Selected</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-tighter">Pick a channel from the left sidebar to start chatting</p>
              </div>
            </div>
          )}
        </Card>

        {/* Right Sidebar: User List */}
        {roomId && (
          <Card className="hidden w-48 flex-col border-border bg-card lg:flex">
            <div className="flex items-center gap-2 border-b border-border p-4">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-xs font-semibold uppercase tracking-wider">Members</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <UserList
                users={usersInRoom}
                typingUsers={typingUsers}
                currentUserId={user.userId}
              />
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
