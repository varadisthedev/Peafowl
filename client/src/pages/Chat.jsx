import { useState, useEffect } from "react";
import { socketEvents, getSocket } from "../services/socket";
import { messageAPI } from "../services/api";
import MessageList from "../components/MessageList";
import MessageInput from "../components/MessageInput";
import RoomSelector from "../components/RoomSelector";
import UserList from "../components/UserList";
import TypingIndicator from "../components/TypingIndicator";
import { Avatar } from "../components/ui/avatar";
import { Tooltip } from "../components/ui/tooltip";
import { DropdownMenu, DropdownMenuItem } from "../components/ui/dropdown-menu";
import { 
  Hash, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  Mic, 
  MicOff, 
  Headphones, 
  ChevronDown, 
  Search, 
  Bell, 
  Pin, 
  HelpCircle,
  FolderPlus
} from "lucide-react";

/**
 * Chat Page Component
 * Overhauled to represent the exact layout of Discord Desktop client.
 * Features a 4-column panel: Server Sidebar, Channel Sidebar, Main Chat Pane, Members List.
 */
export default function Chat({ user, onLogout }) {
  const [roomId, setRoomId] = useState("");
  const [messages, setMessages] = useState([]);
  const [usersInRoom, setUsersInRoom] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Custom states for Discord enhancements
  const [showMembers, setShowMembers] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

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

  // Mock server list for Discord Sidebar feel
  const mockServers = [
    { id: "peafowl", name: "Peafowl Chat", initials: "PF", active: true },
    { id: "react", name: "React Developers", initials: "RE" },
    { id: "tailwind", name: "Tailwind CSS", initials: "TW" },
    { id: "redis", name: "Redis Systems", initials: "RD" },
  ];

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#313338] text-[#f2f3f5] font-sans antialiased select-none">
      
      {/* 1. Server Sidebar (Outermost Left Column - Width 72px) */}
      <div className="flex w-[72px] shrink-0 flex-col items-center gap-2 bg-[#1e1f22] py-3 z-20">
        
        {/* Peafowl Main Server Icon */}
        <Tooltip content="Peafowl Chat Server" side="right">
          <button 
            onClick={() => roomId && handleLeaveRoom()}
            className="group relative flex h-12 w-12 items-center justify-center rounded-[24px] bg-[#5865f2] text-white transition-all duration-200 hover:rounded-[16px] hover:bg-[#5865f2]"
          >
            {/* Discord active indicator line on the very left */}
            <div className="absolute left-[-12px] w-2 rounded-r bg-white transition-all duration-200 h-5 group-hover:h-5 group-hover:left-0" />
            <MessageSquare className="h-6 w-6" />
          </button>
        </Tooltip>

        <div className="h-[2px] w-8 rounded bg-[#35363c] my-1" />

        {/* Mock Server Icons for Discord look */}
        {mockServers.slice(1).map((srv) => (
          <Tooltip key={srv.id} content={srv.name} side="right">
            <button className="group relative flex h-12 w-12 items-center justify-center rounded-[24px] bg-[#313338] text-[#b5bac1] transition-all duration-200 hover:rounded-[16px] hover:bg-[#5865f2] hover:text-white">
              <div className="absolute left-[-12px] w-2 rounded-r bg-white transition-all duration-200 h-0 group-hover:h-5 group-hover:left-0" />
              <span className="text-sm font-semibold tracking-wider">{srv.initials}</span>
            </button>
          </Tooltip>
        ))}

        {/* Add Server Button */}
        <Tooltip content="Add a Server" side="right">
          <button className="group flex h-12 w-12 items-center justify-center rounded-[24px] bg-[#313338] text-[#23a55a] transition-all duration-200 hover:rounded-[16px] hover:bg-[#23a55a] hover:text-white">
            <FolderPlus className="h-5 w-5" />
          </button>
        </Tooltip>
      </div>

      {/* 2. Channel Sidebar (Second Column - Width 240px) */}
      <div className="flex w-60 shrink-0 flex-col bg-[#2b2d31] z-10">
        
        {/* Server Header Dropdown */}
        <DropdownMenu
          trigger={
            <div className="flex h-12 items-center justify-between border-b border-[#1f2023] px-4 hover:bg-[#35373c] transition-colors cursor-pointer font-bold text-sm tracking-wide text-white">
              <span className="truncate">Peafowl</span>
              <ChevronDown className="h-4 w-4 text-[#b5bac1]" />
            </div>
          }
        >
          <div className="px-1 py-1">
            <DropdownMenuItem onClick={() => alert("Server Settings (Mocked)")}>
              <Settings className="mr-2 h-3.5 w-3.5" />
              <span>Server Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => alert("Invite link copied! (Mocked)")}>
              <Users className="mr-2 h-3.5 w-3.5" />
              <span>Invite People</span>
            </DropdownMenuItem>
            <div className="h-px bg-[#2b2d31] my-1" />
            <DropdownMenuItem variant="danger" onClick={onLogout}>
              <LogOut className="mr-2 h-3.5 w-3.5" />
              <span>Log Out</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenu>

        {/* Room List Selector */}
        <div className="flex-1 overflow-y-auto scrollbar-discord-thin py-2">
          <RoomSelector onSelectRoom={setRoomId} currentRoomId={roomId} />
        </div>

        {/* Discord User Profile Panel (Bottom of sidebar) */}
        <div className="flex h-[52px] items-center justify-between bg-[#232428] px-2 py-1 select-none">
          <div className="flex items-center gap-2 overflow-hidden max-w-[120px]">
            <Avatar 
              username={user.username} 
              size="sm" 
              status="online" 
              borderColor="border-[#232428]"
            />
            <div className="flex flex-col overflow-hidden text-left">
              <span className="truncate text-xs font-semibold text-white leading-tight">
                {user.username}
              </span>
              <span className="truncate text-[10px] text-[#949ba4] leading-tight">
                online
              </span>
            </div>
          </div>

          <div className="flex items-center gap-0.5 text-[#b5bac1]">
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="h-8 w-8 rounded hover:bg-[#35373c] hover:text-[#f2f3f5] flex items-center justify-center transition-colors"
              title={isMuted ? "Unmute" : "Mute"}
            >
              {isMuted ? <MicOff className="h-4 w-4 text-[#f23f43]" /> : <Mic className="h-4 w-4" />}
            </button>
            <button 
              onClick={() => setIsDeafened(!isDeafened)} 
              className="h-8 w-8 rounded hover:bg-[#35373c] hover:text-[#f2f3f5] flex items-center justify-center transition-colors"
              title={isDeafened ? "Undeafen" : "Deafen"}
            >
              {isDeafened ? <Settings className="h-4 w-4 text-[#f23f43]" /> : <Headphones className="h-4 w-4" />}
            </button>
            <button 
              onClick={onLogout} 
              className="h-8 w-8 rounded hover:bg-[#f23f43]/20 hover:text-[#f23f43] flex items-center justify-center transition-colors"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Workspace Area (Consists of Top Header + Messages + Members Sidebar) */}
      <div className="flex flex-1 flex-col overflow-hidden bg-[#313338]">
        
        {/* Top Header Bar */}
        <header className="flex h-12 shrink-0 items-center justify-between border-b border-[#1f2023] bg-[#313338] px-4 z-10">
          <div className="flex items-center gap-2 overflow-hidden text-left">
            <Hash className="h-5 w-5 text-[#80848e] shrink-0" />
            <h3 className="truncate text-sm font-bold text-white leading-none">
              {roomId ? roomId : "welcome"}
            </h3>
            {roomId && (
              <>
                <div className="h-4 w-[1px] bg-[#3f4147] mx-2 shrink-0" />
                <span className="hidden md:inline truncate text-xs text-[#949ba4] font-medium leading-none">
                  Welcome to #{roomId}! Chat in real-time.
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 text-[#b5bac1] shrink-0">
            {roomId && (
              <>
                <button className="hidden sm:block h-6 w-6 flex items-center justify-center hover:text-[#f2f3f5]" title="Start Thread">
                  <MessageSquare className="h-4 w-4" />
                </button>
                <button className="hidden sm:block h-6 w-6 flex items-center justify-center hover:text-[#f2f3f5]" title="Notification Settings">
                  <Bell className="h-4 w-4" />
                </button>
                <button className="hidden sm:block h-6 w-6 flex items-center justify-center hover:text-[#f2f3f5]" title="Pinned Messages">
                  <Pin className="h-4 w-4" />
                </button>
                
                {/* Collapsible Members List Toggler */}
                <button 
                  onClick={() => setShowMembers(!showMembers)}
                  className={`h-6 w-6 flex items-center justify-center hover:text-[#f2f3f5] transition-colors ${showMembers ? "text-white" : ""}`}
                  title="Member List"
                >
                  <Users className="h-4 w-4" />
                </button>

                {/* Dummy search input matching Discord */}
                <div className="relative hidden md:block">
                  <input
                    type="text"
                    placeholder="Search"
                    className="h-6 w-36 rounded bg-[#1e1f22] px-2 pr-6 text-xs text-[#f2f3f5] placeholder-[#949ba4] focus-visible:w-60 transition-all duration-200 outline-none border-none"
                    disabled
                  />
                  <Search className="absolute right-1.5 top-1.5 h-3 w-3 text-[#949ba4]" />
                </div>
              </>
            )}
            
            <button className="h-6 w-6 flex items-center justify-center hover:text-[#f2f3f5]" title="Help">
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* Content Container (Main Chat + Members Sidebar) */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Main Chat Feed */}
          <div className="flex flex-1 flex-col overflow-hidden relative">
            {roomId ? (
              <>
                {/* Messages Body */}
                <div className="flex-1 overflow-hidden relative bg-[#313338]">
                  {loading ? (
                    <div className="flex h-full items-center justify-center flex-col gap-2">
                      <div className="flex gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-full bg-[#5865f2] animate-bounce [animation-delay:0s] duration-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#5865f2] animate-bounce [animation-delay:0.15s] duration-300" />
                        <span className="h-2.5 w-2.5 rounded-full bg-[#5865f2] animate-bounce [animation-delay:0.3s] duration-300" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-[#949ba4] mt-2">Connecting to timeline...</p>
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

                {/* Bottom Input Area */}
                <div className="px-4 pb-6 bg-[#313338]">
                  <MessageInput
                    onSendMessage={handleSendMessage}
                    onTyping={handleTyping}
                    channelName={roomId}
                  />
                  <TypingIndicator
                    typingUsers={typingUsers}
                    currentUserId={user.userId}
                  />
                </div>
              </>
            ) : (
              /* Welcome/Empty Channel State */
              <div className="flex h-full flex-col items-center justify-center space-y-4 p-8 text-center select-none bg-[#313338]">
                <div className="rounded-full bg-[#2b2d31] p-6 shadow-md">
                  <MessageSquare className="h-12 w-12 text-[#5865f2]" />
                </div>
                <div className="max-w-md">
                  <h3 className="text-xl font-bold text-white tracking-wide">
                    Welcome to Peafowl!
                  </h3>
                  <p className="text-sm text-[#b5bac1] mt-1.5 leading-relaxed">
                    This is your personal real-time communications terminal. Pick a channel from the left sidebar to load past messages and start chatting.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* 4. Members Sidebar (Right Column - Width 240px, Collapsible) */}
          {roomId && showMembers && (
            <div className="hidden lg:flex w-60 shrink-0 flex-col bg-[#2b2d31] border-l border-[#1f2023]">
              <div className="flex-1 overflow-y-auto scrollbar-discord-thin">
                <UserList
                  users={usersInRoom}
                  typingUsers={typingUsers}
                  currentUserId={user.userId}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
