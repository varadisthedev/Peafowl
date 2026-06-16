import { useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { SendHorizonal } from "lucide-react";

/**
 * MessageInput Component
 * Provides a text area for users to compose and send messages.
 * Includes debounced typing indicator logic.
 */
export default function MessageInput({ onSendMessage, onTyping }) {
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    setContent(val);

    // Emit typing indicator logic
    if (val.trim() && !isTyping) {
      console.log("[MessageInput] User started typing...");
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Reset typing status after 1.5s of inactivity
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        console.log("[MessageInput] Typing timeout reached");
        setIsTyping(false);
        onTyping(false);
      }
    }, 1500);
  };

  const handleSend = () => {
    if (!content.trim()) return;

    console.log(`[MessageInput] Dispatching message: ${content.substring(0, 20)}...`);
    onSendMessage(content.trim());
    
    // Reset state
    setContent("");
    setIsTyping(false);
    
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    onTyping(false);
  };

  const handleKeyDown = (e) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative flex items-end gap-2">
      <div className="relative flex-1">
        <Textarea
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="Compose your message..."
          className="min-h-[44px] max-h-[120px] w-full resize-none border-border bg-card pr-12 text-sm focus-visible:ring-1 focus-visible:ring-foreground scrollbar-none"
          rows={1}
        />
        <div className="absolute right-2 bottom-2 flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-tighter text-muted-foreground opacity-50">
          <span>Shift+Enter for newline</span>
        </div>
      </div>
      
      <Button 
        size="icon" 
        onClick={handleSend} 
        disabled={!content.trim()}
        className="h-11 w-11 shrink-0 bg-foreground text-background hover:bg-foreground/90 disabled:opacity-30 transition-all duration-300"
      >
        <SendHorizonal className="h-5 w-5" />
      </Button>
    </div>
  );
}
