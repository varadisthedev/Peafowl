import { cn } from "../lib/utils";

/**
 * UserList Component
 * Displays users currently present in the active chat room.
 * Highlights users who are currently typing.
 */
export default function UserList({ users, typingUsers, currentUserId }) {
  console.log(`[UserList] Rendering ${users.length} members`);

  return (
    <div className="flex flex-col gap-3">
      {users.length === 0 ? (
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center py-4">
          No members online
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {users.map((member) => {
            const memberId = member && typeof member === "object" ? member.userId : member;
            const memberName = member && typeof member === "object" ? member.username : member;
            const isMe = memberId === currentUserId;
            const isTyping = typingUsers[memberId] && !isMe;
            
            // Generate initials for avatar
            const initials = memberName ? memberName.substring(0, 2).toUpperCase() : "??";

            return (
              <li 
                key={memberId} 
                className="group flex items-center gap-3"
              >
                <div className={cn(
                  "relative h-7 w-7 rounded-sm flex items-center justify-center text-[10px] font-bold border border-border transition-all duration-300",
                  isMe ? "bg-foreground text-background" : "bg-muted text-muted-foreground group-hover:bg-background group-hover:text-foreground"
                )}>
                  {initials}
                  {/* Status Indicator */}
                  <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-card bg-green-500" />
                </div>
                
                <div className="flex flex-col overflow-hidden">
                  <span className={cn(
                    "truncate text-xs font-medium transition-colors",
                    isMe ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}>
                    {memberName} {isMe && <span className="text-[9px] opacity-50 font-normal ml-1 tracking-tighter">(YOU)</span>}
                  </span>
                  
                  {isTyping && (
                    <span className="text-[9px] font-bold text-foreground animate-pulse tracking-tighter">
                      TYPING...
                    </span>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
