import { useState, useEffect } from "react";

export default function MessageInput({ onSendMessage, onTyping }) {
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeout = { current: null };

  const handleChange = (e) => {
    setContent(e.target.value);

    // Send typing indicator
    if (!isTyping) {
      console.log("[MessageInput] User started typing");
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    // Set timeout to stop typing
    typingTimeout.current = setTimeout(() => {
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
    onSendMessage(content);
    setContent("");
    setIsTyping(false);
    onTyping(false);
  };

  return (
    <div>
      <h3>[MESSAGE INPUT]</h3>
      <textarea
        value={content}
        onChange={handleChange}
        placeholder="Type a message..."
        style={{ width: "100%", height: "80px", marginBottom: "10px" }}
      />
      <br />
      <button onClick={handleSend}>[SEND MESSAGE]</button>
    </div>
  );
}
