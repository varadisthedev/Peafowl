import { useState, useEffect, useRef } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Pencil, Trash2, Check, X, Clock } from "lucide-react";

/**
 * MessageList Component
 * Renders the stream of chat messages with support for editing and deleting.
 * Optimized for a sleek black-and-white aesthetic with minimal card bubbles.
 */
export default function MessageList({
  messages,
  currentUser,
  onDeleteMessage,
  onEditMessage,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const scrollRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleEditStart = (messageId, content) => {
    console.log(`[MessageList] Editing message: ${messageId}`);
    setEditingId(messageId);
    setEditContent(content);
  };

  const handleEditSave = (messageId) => {
    if (!editContent.trim()) return;
    console.log(`[MessageList] Saving changes for: ${messageId}`);
    onEditMessage(messageId, editContent.trim());
    setEditingId(null);
    setEditContent("");
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div 
      ref={scrollRef}
      className="flex h-full flex-col gap-4 overflow-y-auto p-4 scroll-smooth"
    >
      {messages.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center space-y-2 opacity-30">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em]">End of Transcript</p>
          <div className="h-px w-12 bg-foreground" />
        </div>
      ) : (
        messages.map((msg, index) => {
          const senderId = typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
          const senderName = typeof msg.sender === "object" ? msg.sender?.username : msg.sender;
          const isMe = senderName === currentUser;

          const prevSenderId = index > 0 ? (typeof messages[index - 1].sender === "object" ? messages[index - 1].sender?._id : messages[index - 1].sender) : null;
          const showSender = index === 0 || prevSenderId !== senderId;

          return (
            <div
              key={msg._id}
              className={cn(
                "flex flex-col max-w-[85%] transition-all duration-300 animate-in fade-in slide-in-from-bottom-2",
                isMe ? "self-end items-end" : "self-start items-start"
              )}
            >
              {showSender && !isMe && (
                <span className="mb-1 ml-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  {senderName}
                </span>
              )}

              <div className="group relative">
                {editingId === msg._id ? (
                  <div className="flex flex-col gap-2 min-w-[200px] rounded-sm border border-border bg-card p-2 shadow-sm">
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="min-h-[60px] resize-none border-none bg-muted/50 p-2 text-xs focus-visible:ring-0"
                      autoFocus
                    />
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => setEditingId(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-green-500" onClick={() => handleEditSave(msg._id)}>
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={cn(
                      "relative rounded-sm px-3 py-2 text-sm shadow-sm transition-all group-hover:shadow-md",
                      isMe 
                        ? "bg-foreground text-background" 
                        : "border border-border bg-card text-foreground"
                    )}
                  >
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    
                    {/* Message Actions (Visible on hover) */}
                    {isMe && (
                      <div className={cn(
                        "absolute -left-12 top-0 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100",
                        "bg-card border border-border rounded-sm p-0.5"
                      )}>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 hover:bg-muted" 
                          onClick={() => handleEditStart(msg._id, msg.content)}
                        >
                          <Pencil className="h-2.5 w-2.5" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive" 
                          onClick={() => onDeleteMessage(msg._id)}
                        >
                          <Trash2 className="h-2.5 w-2.5" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Message Metadata */}
              <div className={cn(
                "mt-1 flex items-center gap-1.5 px-1 text-[9px] font-medium text-muted-foreground uppercase tracking-tighter",
                isMe ? "flex-row-reverse" : "flex-row"
              )}>
                <span className="flex items-center gap-0.5">
                  <Clock className="h-2 w-2" />
                  {formatTime(msg.timestamp)}
                </span>
                {msg.isEdited && (
                  <>
                    <span>•</span>
                    <span>Edited</span>
                  </>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
