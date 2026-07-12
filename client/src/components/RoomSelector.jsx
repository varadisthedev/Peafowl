import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Plus, Hash, X } from "lucide-react";
import { cn } from "../lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "./ui/dialog";

/**
 * RoomSelector Component
 * Allows users to join or create chat rooms.
 * Formatted to look exactly like Discord's Channel Sidebar list.
 */
export default function RoomSelector({ onSelectRoom, currentRoomId }) {
  const [newRoomId, setNewRoomId] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  
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
    setIsOpen(false); // Close dialog modal
  };

  const handleSelectRoom = (roomId) => {
    console.log(`[RoomSelector] Room selected: ${roomId}`);
    onSelectRoom(roomId);
  };

  return (
    <div className="flex flex-col gap-4 select-none">
      
      {/* Category Header with Create Channel trigger */}
      <div className="flex items-center justify-between px-3 pt-2 text-[11px] font-bold uppercase tracking-wider text-[#949ba4]">
        <span className="hover:text-[#f2f3f5] cursor-default transition-colors">Text Channels</span>
        <button 
          onClick={() => setIsOpen(true)}
          className="text-[#949ba4] hover:text-[#f2f3f5] transition-colors"
          title="Create Channel"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* Channels List */}
      <div className="flex flex-col gap-0.5 px-2">
        {rooms.map((room) => {
          const isActive = currentRoomId === room;
          return (
            <button
              key={room}
              onClick={() => handleSelectRoom(room)}
              className={cn(
                "group flex items-center justify-between rounded px-2 py-1.5 text-[14px] font-medium transition-colors text-left",
                isActive 
                  ? "bg-[#35373c] text-white" 
                  : "text-[#949ba4] hover:bg-[#35373c]/60 hover:text-[#dbdee1]"
              )}
            >
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Hash className={cn("h-5 w-5 shrink-0", isActive ? "text-[#f2f3f5]" : "text-[#80848e] group-hover:text-[#dbdee1]")} />
                <span className="truncate">{room}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Discord Dialog Modal for Creating Channels */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[440px] rounded bg-[#313338] border-none text-[#f2f3f5] p-5 shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold text-white tracking-wide">
              Create Channel
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[#b5bac1] flex items-center gap-1">
                Channel Name
              </label>
              
              <div className="relative flex items-center bg-[#1e1f22] rounded">
                <Hash className="absolute left-3 h-5 w-5 text-[#80848e]" />
                <Input
                  type="text"
                  value={newRoomId}
                  onChange={(e) => setNewRoomId(e.target.value)}
                  placeholder="new-channel"
                  className="h-10 w-full rounded border-none bg-transparent pl-10 pr-3 text-[14px] text-[#f2f3f5] focus-visible:ring-0 placeholder:text-[#949ba4] focus-visible:outline-none"
                  onKeyDown={(e) => e.key === "Enter" && handleAddRoom()}
                  autoFocus
                />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-3 bg-[#2b2d31] p-3 -mx-5 -mb-5 rounded-b">
            <Button
              variant="ghost"
              onClick={() => setIsOpen(false)}
              className="h-9 px-4 text-xs font-semibold text-white hover:underline hover:bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddRoom}
              disabled={!newRoomId.trim()}
              className="h-9 px-5 rounded bg-[#5865f2] hover:bg-[#4752c4] active:bg-[#3c45a5] font-semibold text-white text-xs transition-colors disabled:opacity-50"
            >
              Create Channel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
