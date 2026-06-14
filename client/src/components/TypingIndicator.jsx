/**
 * Animated typing indicator shown below the message list.
 * Displays who is currently typing in the active room.
 */
export default function TypingIndicator({ typingUsers, currentUserId }) {
  const activeTypers = Object.entries(typingUsers)
    .filter(([userId, isTyping]) => isTyping && userId !== currentUserId)
    .map(([userId]) => userId);

  if (activeTypers.length === 0) return null;

  const label =
    activeTypers.length === 1
      ? `${activeTypers[0]} is typing`
      : activeTypers.length === 2
        ? `${activeTypers[0]} and ${activeTypers[1]} are typing`
        : `${activeTypers.slice(0, -1).join(", ")} and ${activeTypers.at(-1)} are typing`;

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "6px 10px",
        marginBottom: "8px",
        fontSize: "0.85rem",
        color: "#6b7280",
        fontStyle: "italic",
      }}
      aria-live="polite"
      aria-label={label}
    >
      <span className="typing-dots" style={{ display: "inline-flex", gap: "3px" }}>
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#9ca3af",
            animation: "typingBounce 1.2s infinite ease-in-out",
            animationDelay: "0ms",
          }}
        />
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#9ca3af",
            animation: "typingBounce 1.2s infinite ease-in-out",
            animationDelay: "150ms",
          }}
        />
        <span
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#9ca3af",
            animation: "typingBounce 1.2s infinite ease-in-out",
            animationDelay: "300ms",
          }}
        />
      </span>
      <span>{label}…</span>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
