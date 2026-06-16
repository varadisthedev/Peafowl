import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Hash } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * RoomSelector Component
 * Allows users to join or create chat rooms.
 * Designed as a vertical list of channels for the sidebar.
 */
export default function RoomSelector({ onSelectRoom, currentRoomId }) {
  const [newRoomId, setNewRoomId] = useState("");
  // Default rooms list
  const [rooms, setRooms] = useState(["general", "development", "random", "feedback"]);

  const handleAddRoom = () => {
    const trimmedRoom = newRoomId.trim().toLowerCase().replace(/\s+/g, '-');
    if (!trimmedRoom) {
      console.warn("[RoomSelector] Cannot add empty room ID");
      return;
    }

    console.log(`[RoomSelector] Adding/Joining room: ${trimmedRoom}`);
    if (!rooms.includes(trimmedRoom)) {
      setRooms((prev) => [...prev, trimmedRoom]);
    }
    onSelectRoom(trimmedRoom);
    setNewRoomId("");
  };

  const handleSelectRoom = (roomId) => {
    console.log(`[RoomSelector] Room selected: ${roomId}`);
    onSelectRoom(roomId);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Join/Create Input */}
      <div className="flex flex-col gap-2 px-2">
        <div className="relative group">
          <Input
            type="text"
            value={newRoomId}
            onChange={(e) => setNewRoomId(e.target.value)}
            placeholder="new-channel"
            className="h-8 border-border bg-muted/50 text-xs focus-visible:ring-1 focus-visible:ring-foreground pr-8"
            onKeyDown={(e) => e.key === "Enter" && handleAddRoom()}
          />
          <button 
            onClick={handleAddRoom}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Rooms List */}
      <div className="flex flex-col gap-1 px-1">
        {rooms.map((room) => {
          const isActive = currentRoomId === room;
          return (
            <button
              key={room}
              onClick={() => handleSelectRoom(room)}
              className={cn(
                "group flex items-center justify-between rounded-sm px-3 py-2 text-xs font-medium transition-all duration-200",
                isActive 
                  ? "bg-foreground text-background" 
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <div className="flex items-center gap-2">
                <Hash className={cn("h-3.5 w-3.5", isActive ? "text-background" : "text-muted-foreground")} />
                <span className="truncate">{room}</span>
              </div>
              {isActive && <div className="h-1 w-1 rounded-full bg-background" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
