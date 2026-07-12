import { cn } from "../lib/utils";
import { Avatar } from "./ui/avatar";

/**
 * UserList Component
 * Displays users currently present in the active chat room.
 * Groups users under ONLINE and OFFLINE blocks, supporting avatars.
 */
export default function UserList({ users, typingUsers, currentUserId }) {
  console.log(`[UserList] Rendering ${users.length} members`);

  // Active users in the room
  const onlineMembers = users.map((member) => {
    const memberId = member && typeof member === "object" ? member.userId : member;
    const memberName = member && typeof member === "object" ? member.username : member;
    const isMe = memberId === currentUserId;
    const isTyping = typingUsers[memberId] && !isMe;
    return {
      userId: memberId,
      username: memberName || "Unknown User",
      isMe,
      isTyping,
      status: "online"
    };
  });

  // Mock offline members for Discord high-fidelity UI aesthetics
  const offlineMembers = [
    { userId: "offline-1", username: "clyde", isMe: false, isTyping: false, status: "offline" },
    { userId: "offline-2", username: "wumpus", isMe: false, isTyping: false, status: "offline" },
    { userId: "offline-3", username: "nellie", isMe: false, isTyping: false, status: "offline" },
  ];

  return (
    <div className="flex flex-col gap-5 px-4 py-6 select-none text-left">
      
      {/* 1. Online Group */}
      <div className="flex flex-col gap-1.5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#949ba4] mb-1">
          Online — {onlineMembers.length}
        </h4>
        
        {onlineMembers.length === 0 ? (
          <p className="text-xs text-[#949ba4] italic py-2 px-2">No members online</p>
        ) : (
          <ul className="flex flex-col gap-1">
            {onlineMembers.map((member) => (
              <li 
                key={member.userId} 
                className="group flex items-center gap-2.5 rounded px-2 py-1.5 hover:bg-[#35373c]/50 transition-colors cursor-pointer"
              >
                <Avatar
                  username={member.username}
                  size="sm"
                  status="online"
                  borderColor="border-[#2b2d31] group-hover:border-[#35373c]/50"
                />
                
                <div className="flex flex-col overflow-hidden leading-tight">
                  <span className={cn(
                    "truncate text-sm font-medium transition-colors",
                    member.isMe ? "text-[#f2f3f5]" : "text-[#b5bac1] group-hover:text-[#dbdee1]"
                  )}>
                    {member.username}
                  </span>
                  
                  {member.isMe && (
                    <span className="text-[9px] text-[#949ba4] font-semibold tracking-wide uppercase mt-0.5">
                      You
                    </span>
                  )}

                  {member.isTyping && (
                    <span className="text-[9px] font-bold text-[#23a55a] animate-pulse uppercase tracking-wider mt-0.5">
                      Typing...
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 2. Offline Group (Mocked for visual balance) */}
      <div className="flex flex-col gap-1.5">
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#949ba4] mb-1">
          Offline — {offlineMembers.length}
        </h4>
        
        <ul className="flex flex-col gap-1">
          {offlineMembers.map((member) => (
            <li 
              key={member.userId} 
              className="group flex items-center gap-2.5 rounded px-2 py-1.5 hover:bg-[#35373c]/30 opacity-60 hover:opacity-100 transition-all cursor-pointer"
            >
              <Avatar
                username={member.username}
                size="sm"
                status="offline"
                borderColor="border-[#2b2d31] group-hover:border-[#35373c]/30"
              />
              
              <div className="flex flex-col overflow-hidden leading-tight">
                <span className="truncate text-sm font-medium text-[#949ba4] group-hover:text-[#dbdee1] transition-colors">
                  {member.username}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}
