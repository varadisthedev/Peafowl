import { useEffect, useRef, useState } from "react";
import { Plus, Gift, FileCode, Smile, Send } from "lucide-react";

/**
 * MessageInput Component
 * Provides a text area for users to compose and send messages.
 * Formatted like Discord's signature input field: pill shape, attachment icon, emoji trigger.
 */
export default function MessageInput({ onSendMessage, onTyping, channelName = "general" }) {
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // Auto-resize textarea to fit text height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [content]);

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
    
    if (textareaRef.current) {
      textareaRef.current.style.height = "44px";
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="relative w-full select-none text-left">
      <div className="flex items-center gap-4 rounded-lg bg-[#383a40] px-4 py-2.5">
        
        {/* Mock Attachment Plus Button */}
        <button 
          onClick={() => alert("Uploads are mocked! Write markdown like links or code instead.")}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#4e5058] hover:bg-[#6d6f78] text-[#dbdee1] transition-colors"
          title="Upload File"
        >
          <Plus className="h-4 w-4 text-[#383a40] fill-[#dbdee1]" />
        </button>

        {/* Text Area Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={`Message #${channelName}`}
          rows={1}
          className="h-6 max-h-[180px] flex-1 resize-none border-none bg-transparent py-0.5 text-[15px] text-[#f2f3f5] placeholder-[#6d7178] focus-visible:outline-none focus-visible:ring-0 leading-tight"
        />

        {/* Action icons on right */}
        <div className="flex items-center gap-2.5 text-[#b5bac1]">
          <button 
            onClick={() => setContent(prev => prev + " **bold**")}
            className="hidden sm:block hover:text-[#f2f3f5] transition-colors"
            title="Insert Bold Text"
          >
            <strong className="text-sm">B</strong>
          </button>
          
          <button 
            onClick={() => setContent(prev => prev + " ```javascript\n\n```")}
            className="hidden sm:block hover:text-[#f2f3f5] transition-colors"
            title="Insert Code Block"
          >
            <FileCode className="h-5 w-5" />
          </button>

          <button 
            onClick={() => setContent(prev => prev + " 🙂")}
            className="hover:text-[#f2f3f5] transition-colors"
            title="Insert Emoji"
          >
            <Smile className="h-5 w-5" />
          </button>

          {/* Send Icon (helpful fallback, especially for tablet/mobile layout) */}
          {content.trim() && (
            <button 
              onClick={handleSend}
              className="flex h-6 w-6 items-center justify-center text-[#5865f2] hover:text-white transition-colors"
              title="Send Message"
            >
              <Send className="h-4 w-4 fill-current" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
