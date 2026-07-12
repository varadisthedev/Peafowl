/**
 * TypingIndicator Component
 * Displays a notification when other users are typing.
 * Styled as a sleek, low-contrast notification bar positioned below the input box.
 */
export default function TypingIndicator({ typingUsers, currentUserId }) {
  const activeTypers = Object.entries(typingUsers)
    .filter(([userId, isTypingVal]) => isTypingVal && userId !== currentUserId)
    .map(([userId, isTypingVal]) => typeof isTypingVal === "string" ? isTypingVal : userId);

  // Maintain height even when empty to prevent layout shifts
  if (activeTypers.length === 0) return <div className="h-5" />;

  console.log(`[TypingIndicator] Active typers: ${activeTypers.join(", ")}`);

  const label =
    activeTypers.length === 1
      ? `${activeTypers[0]}`
      : activeTypers.length === 2
        ? `${activeTypers[0]} and ${activeTypers[1]}`
        : `${activeTypers.slice(0, -2).join(", ")}, ${activeTypers.slice(-2, -1)}, and ${activeTypers.slice(-1)}`;

  const suffix = activeTypers.length === 1 ? " is typing..." : " are typing...";

  return (
    <div
      className="flex items-center gap-2 px-1 py-0.5 animate-in fade-in slide-in-from-bottom-1 duration-200 select-none text-left"
      aria-live="polite"
    >
      {/* Discord Typing Animation Dots */}
      <div className="flex gap-1 items-center h-2 shrink-0">
        <span className="h-1.5 w-1.5 rounded-full bg-[#dbdee1] animate-bounce [animation-duration:1s] [animation-delay:0s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#dbdee1] animate-bounce [animation-duration:1s] [animation-delay:0.15s]" />
        <span className="h-1.5 w-1.5 rounded-full bg-[#dbdee1] animate-bounce [animation-duration:1s] [animation-delay:0.3s]" />
      </div>
      
      {/* Label */}
      <span className="text-xs text-[#949ba4] font-medium leading-none">
        <strong className="text-[#dbdee1] font-semibold">{label}</strong>
        {suffix}
      </span>
    </div>
  );
}
