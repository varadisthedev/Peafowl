/**
 * TypingIndicator Component
 * Displays a subtle, animated notification when other users are typing.
 * Utilizes sleek B&W dots and minimal typography.
 */
export default function TypingIndicator({ typingUsers, currentUserId }) {
  const activeTypers = Object.entries(typingUsers)
    .filter(([userId, isTypingVal]) => isTypingVal && userId !== currentUserId)
    .map(([userId, isTypingVal]) => typeof isTypingVal === "string" ? isTypingVal : userId);

  if (activeTypers.length === 0) return <div className="h-6" />; // Maintain height to prevent layout shift

  console.log(`[TypingIndicator] Active typers: ${activeTypers.join(", ")}`);

  const label =
    activeTypers.length === 1
      ? `${activeTypers[0]} is typing`
      : activeTypers.length === 2
        ? `${activeTypers[0]} and ${activeTypers[1]} are typing`
        : `${activeTypers.slice(0, -1).join(", ")} and ${activeTypers.at(-1)} are typing`;

  return (
    <div
      className="flex items-center gap-2 px-1 py-1 animate-in fade-in slide-in-from-bottom-1 duration-300"
      aria-live="polite"
      aria-label={label}
    >
      {/* Sleek B&W Dots */}
      <div className="flex gap-1">
        <span className="h-1 w-1 rounded-full bg-foreground/40 animate-bounce [animation-duration:1s] [animation-delay:0s]" />
        <span className="h-1 w-1 rounded-full bg-foreground/40 animate-bounce [animation-duration:1s] [animation-delay:0.2s]" />
        <span className="h-1 w-1 rounded-full bg-foreground/40 animate-bounce [animation-duration:1s] [animation-delay:0.4s]" />
      </div>
      
      {/* Label */}
      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/80">
        {label}
      </span>
    </div>
  );
}
