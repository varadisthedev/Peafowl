import { useEffect, useRef, useState } from "react";

export default function MessageInput({ onSendMessage, onTyping }) {
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleChange = (e) => {
    setContent(e.target.value);

    // Send typing indicator
    if (!isTyping) {
      console.log("[MessageInput] User started typing");
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      console.log("[MessageInput] User stopped typing");
      setIsTyping(false);
      onTyping(false);
    }, 1000);
  };

  const handleSend = () => {
    if (!content.trim()) {
      console.log("[MessageInput] Empty message, not sending");
      return;
    }

    console.log("[MessageInput] Sending message:", content);
    const trimmedContent = content.trim();
    onSendMessage(trimmedContent);
    setContent("");
    setIsTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    onTyping(false);
  };

  return (
    <div>
      <h3>[MESSAGE INPUT]</h3>
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Type a message..."
        style={{
          width: "100%",
          height: "80px",
          marginBottom: "10px",
          backgroundColor: "#d1d5db",
          color: "#111827",
        }}
      />
      <br />
      <button onClick={handleSend}>[SEND MESSAGE]</button>
    </div>
  );
}
