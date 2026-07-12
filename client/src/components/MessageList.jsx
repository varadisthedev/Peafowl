import { useState, useEffect, useRef } from "react";
import { cn } from "../lib/utils";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Avatar } from "./ui/avatar";
import { Tooltip } from "./ui/tooltip";
import { 
  Pencil, 
  Trash2, 
  CornerUpLeft, 
  Smile, 
  MoreHorizontal 
} from "lucide-react";

/**
 * MessageList Component
 * Overhauled to perfectly match Discord's scrolling chat timeline.
 * Groups consecutive messages from the same sender within 5 mins,
 * supports full markdown rendering, and a floating actions menu on hover.
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

  const handleKeyDown = (e, messageId) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleEditSave(messageId);
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditContent("");
    }
  };

  const formatHeaderTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.toDateString() === yesterday.toDateString();
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isToday) return `Today at ${timeStr}`;
    if (isYesterday) return `Yesterday at ${timeStr}`;
    
    return `${date.toLocaleDateString([], { month: '2-digit', day: '2-digit', year: 'numeric' })} ${timeStr}`;
  };

  const formatHoverTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  // Parse custom Markdown syntax: bold, italic, code-blocks, inline-code, and links
  const renderMessageContent = (content) => {
    if (!content) return null;

    // 1. Extract code blocks first to prevent tokenizing inside code
    const codeBlockRegex = /```([\s\S]*?)```/g;
    let codeBlocks = [];
    let textWithPlaceholders = content.replace(codeBlockRegex, (match, code) => {
      const id = `__CODE_BLOCK_${codeBlocks.length}__`;
      codeBlocks.push(
        <pre key={id} className="my-1.5 rounded bg-[#1e1f22] p-3 font-mono text-[12px] text-[#e3e6eb] border border-[#2b2d31] overflow-x-auto leading-relaxed select-text">
          <code>{code}</code>
        </pre>
      );
      return id;
    });

    // 2. Parse inline tokens line-by-line
    const parseInline = (line, lineKey) => {
      let tokens = [{ type: 'text', value: line }];
      
      // Inline Code: `code`
      tokens = tokens.flatMap((t) => {
        if (t.type !== 'text') return t;
        const parts = t.value.split(/`([^`]+)`/g);
        return parts.map((val, idx) => ({
          type: idx % 2 === 1 ? 'code' : 'text',
          value: val
        }));
      });

      // Bold: **text**
      tokens = tokens.flatMap((t) => {
        if (t.type !== 'text') return t;
        const parts = t.value.split(/\*\*([^*]+)\*\*/g);
        return parts.map((val, idx) => ({
          type: idx % 2 === 1 ? 'bold' : 'text',
          value: val
        }));
      });

      // Italics: *text*
      tokens = tokens.flatMap((t) => {
        if (t.type !== 'text') return t;
        const parts = t.value.split(/\*([^*]+)\*/g);
        return parts.map((val, idx) => ({
          type: idx % 2 === 1 ? 'italic' : 'text',
          value: val
        }));
      });

      // Links
      tokens = tokens.flatMap((t) => {
        if (t.type !== 'text') return t;
        const parts = t.value.split(/(https?:\/\/[^\s]+)/g);
        return parts.map((val, idx) => ({
          type: idx % 2 === 1 ? 'link' : 'text',
          value: val
        }));
      });

      return (
        <span key={lineKey}>
          {tokens.map((tok, index) => {
            if (tok.type === 'code') {
              return (
                <code key={index} className="rounded bg-[#1e1f22] px-1 py-0.5 font-mono text-[12px] text-[#e3e6eb]">
                  {tok.value}
                </code>
              );
            }
            if (tok.type === 'bold') {
              return (
                <strong key={index} className="font-bold text-white">
                  {tok.value}
                </strong>
              );
            }
            if (tok.type === 'italic') {
              return (
                <em key={index} className="italic text-[#dbdee1]">
                  {tok.value}
                </em>
              );
            }
            if (tok.type === 'link') {
              return (
                <a 
                  key={index} 
                  href={tok.value} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-[#00a8fc] hover:underline"
                >
                  {tok.value}
                </a>
              );
            }
            return tok.value;
          })}
        </span>
      );
    };

    // Split text by placeholder tokens
    const lines = textWithPlaceholders.split("\n");
    return lines.map((line, lineIdx) => {
      if (line.startsWith("__CODE_BLOCK_") && line.endsWith("__")) {
        const idx = parseInt(line.replace(/__CODE_BLOCK_(\d+)__/, "$1"));
        return codeBlocks[idx];
      }
      return (
        <div key={lineIdx} className="min-h-[1.25rem] text-[#dbdee1] leading-[1.375rem] break-words select-text">
          {parseInline(line, lineIdx)}
        </div>
      );
    });
  };

  // Group consecutive messages by user within 5 minutes
  const groupedMessages = [];
  messages.forEach((msg, idx) => {
    const senderId = typeof msg.sender === "object" ? msg.sender?._id : msg.sender;
    const senderName = typeof msg.sender === "object" ? msg.sender?.username : msg.sender;
    
    const prevMsg = idx > 0 ? messages[idx - 1] : null;
    const prevSenderId = prevMsg ? (typeof prevMsg.sender === "object" ? prevMsg.sender?._id : prevMsg.sender) : null;
    
    const timeDiff = prevMsg ? new Date(msg.timestamp) - new Date(prevMsg.timestamp) : 0;
    
    // Group criteria: same sender and sent within 5 minutes
    const isGrouped = prevMsg && prevSenderId === senderId && timeDiff < 5 * 60 * 1000;
    
    groupedMessages.push({
      ...msg,
      senderName,
      senderId,
      isGrouped
    });
  });

  return (
    <div 
      ref={scrollRef}
      className="flex h-full flex-col overflow-y-auto py-4 select-none scroll-smooth bg-[#313338]"
    >
      {groupedMessages.length === 0 ? (
        /* Empty Feed / Start of conversation */
        <div className="flex h-full flex-col items-center justify-center p-8 text-center text-[#949ba4]">
          <div className="rounded-full bg-[#2b2d31] p-4 mb-2">
            <CornerUpLeft className="h-8 w-8 text-[#5865f2]" />
          </div>
          <h4 className="text-sm font-bold text-white">This is the start of this channel</h4>
          <p className="text-xs mt-1 max-w-[280px]">Send messages, code blocks, or links here. Type your first message below.</p>
        </div>
      ) : (
        groupedMessages.map((msg) => {
          const isMe = msg.senderName === currentUser;
          const isEditing = editingId === msg._id;

          return (
            <div
              key={msg._id}
              className={cn(
                "group relative w-full flex items-start px-16 py-[3px] transition-colors duration-150 hover:bg-[#2e3035]/30",
                msg.isGrouped ? "mt-[1px]" : "mt-4"
              )}
            >
              
              {/* Message Header or Hover Timestamp */}
              {!msg.isGrouped ? (
                /* Full message profile (un-grouped) */
                <>
                  <div className="absolute left-4 top-[3px]">
                    <Avatar 
                      username={msg.senderName} 
                      size="sm" 
                      borderColor="border-[#313338] group-hover:border-[#2e3035]"
                    />
                  </div>
                  <div className="flex flex-col w-full text-left">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-white hover:underline cursor-pointer">
                        {msg.senderName}
                      </span>
                      <span className="text-[10px] font-medium text-[#949ba4]">
                        {formatHeaderTime(msg.timestamp)}
                      </span>
                    </div>

                    {/* Inline Content or Edit State */}
                    {isEditing ? (
                      <div className="flex flex-col gap-1.5 w-full mt-1">
                        <div className="rounded bg-[#383a40] p-3 border border-[#3f4147]">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, msg._id)}
                            className="min-h-[44px] max-h-[200px] w-full resize-none border-none bg-transparent p-0 text-sm text-[#f2f3f5] focus-visible:ring-0 focus-visible:outline-none focus-visible:border-none"
                            autoFocus
                          />
                        </div>
                        <span className="text-[10px] text-[#949ba4] font-medium">
                          escape to <button onClick={() => setEditingId(null)} className="text-[#00a8fc] hover:underline">cancel</button> • enter to <button onClick={() => handleEditSave(msg._id)} className="text-[#00a8fc] hover:underline">save</button>
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-[#dbdee1]">
                        {renderMessageContent(msg.content)}
                        {msg.isEdited && (
                          <span className="text-[10px] text-[#949ba4] ml-1 select-none">(edited)</span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Grouped message: compact display */
                <>
                  {/* Left gutter displays timestamp on hover */}
                  <span className="absolute left-4 top-[6px] w-8 text-right text-[9px] font-medium text-[#949ba4] opacity-0 group-hover:opacity-100 select-none">
                    {formatHoverTime(msg.timestamp)}
                  </span>
                  
                  <div className="flex flex-col w-full text-left">
                    {isEditing ? (
                      <div className="flex flex-col gap-1.5 w-full mt-1">
                        <div className="rounded bg-[#383a40] p-3 border border-[#3f4147]">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={(e) => handleKeyDown(e, msg._id)}
                            className="min-h-[44px] max-h-[200px] w-full resize-none border-none bg-transparent p-0 text-sm text-[#f2f3f5] focus-visible:ring-0 focus-visible:outline-none focus-visible:border-none"
                            autoFocus
                          />
                        </div>
                        <span className="text-[10px] text-[#949ba4] font-medium">
                          escape to <button onClick={() => setEditingId(null)} className="text-[#00a8fc] hover:underline">cancel</button> • enter to <button onClick={() => handleEditSave(msg._id)} className="text-[#00a8fc] hover:underline">save</button>
                        </span>
                      </div>
                    ) : (
                      <div className="text-sm text-[#dbdee1]">
                        {renderMessageContent(msg.content)}
                        {msg.isEdited && (
                          <span className="text-[10px] text-[#949ba4] ml-1 select-none">(edited)</span>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* Floating Action Bar (Visible on hover) */}
              {!isEditing && (
                <div className="absolute right-4 top-[-14px] z-10 flex items-center bg-[#313338] border border-[#1f2023] rounded shadow-[0_2px_4px_rgba(0,0,0,0.2)] opacity-0 group-hover:opacity-100 transition-opacity p-0.5">
                  <Tooltip content="Add Reaction" side="top">
                    <button className="h-6 w-6 rounded hover:bg-[#35373c] hover:text-white flex items-center justify-center text-[#b5bac1]">
                      <Smile className="h-4 w-4" />
                    </button>
                  </Tooltip>
                  <Tooltip content="Reply" side="top">
                    <button className="h-6 w-6 rounded hover:bg-[#35373c] hover:text-white flex items-center justify-center text-[#b5bac1]">
                      <CornerUpLeft className="h-4 w-4" />
                    </button>
                  </Tooltip>
                  
                  {isMe && (
                    <>
                      <Tooltip content="Edit Message" side="top">
                        <button 
                          onClick={() => handleEditStart(msg._id, msg.content)}
                          className="h-6 w-6 rounded hover:bg-[#35373c] hover:text-white flex items-center justify-center text-[#b5bac1]"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Delete Message" side="top">
                        <button 
                          onClick={() => onDeleteMessage(msg._id)}
                          className="h-6 w-6 rounded hover:bg-[#f23f43]/20 hover:text-[#f23f43] flex items-center justify-center text-[#b5bac1]"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </Tooltip>
                    </>
                  )}
                  
                  <Tooltip content="More Options" side="top">
                    <button className="h-6 w-6 rounded hover:bg-[#35373c] hover:text-white flex items-center justify-center text-[#b5bac1]">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </Tooltip>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
}
