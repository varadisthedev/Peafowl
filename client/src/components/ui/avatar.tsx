import * as React from "react"
import { cn } from "@/lib/utils"

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  username?: string
  src?: string
  size?: "xs" | "sm" | "md" | "lg" | "xl"
  status?: "online" | "idle" | "dnd" | "offline" | "none"
  borderColor?: string // Custom border color for status indicator cut-out
}

export function Avatar({
  username = "??",
  src,
  size = "md",
  status = "none",
  borderColor = "border-[#2b2d31]",
  className,
  ...props
}: AvatarProps) {
  const initials = username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const sizeClasses = {
    xs: "h-5 w-5 text-[9px] font-semibold",
    sm: "h-8 w-8 text-xs font-semibold",
    md: "h-10 w-10 text-sm font-semibold",
    lg: "h-12 w-12 text-base font-semibold",
    xl: "h-20 w-20 text-2xl font-bold",
  };

  const statusSizeClasses = {
    xs: "h-1.5 w-1.5 -bottom-0.5 -right-0.5 border-[1px]",
    sm: "h-2.5 w-2.5 -bottom-0.5 -right-0.5 border-2",
    md: "h-3 w-3 -bottom-0.5 -right-0.5 border-2",
    lg: "h-3.5 w-3.5 -bottom-0.5 -right-0.5 border-2",
    xl: "h-6 w-6 -bottom-1 -right-1 border-3",
  };

  const statusColorClasses = {
    online: "bg-[#23a55a]",
    idle: "bg-[#f0b232]",
    dnd: "bg-[#f23f43]",
    offline: "bg-[#80848e]",
    none: "",
  };

  // Generate a consistent dark background color based on the username for visual appeal
  const getAvatarBg = (name: string) => {
    if (name === "??") return "bg-[#35363c]";
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      "bg-[#5865F2]", // Blurple
      "bg-[#23A55A]", // Green
      "bg-[#F0B232]", // Yellow
      "bg-[#F23F43]", // Red
      "bg-[#E91E63]", // Pink
      "bg-[#9C27B0]", // Purple
      "bg-[#00BCD4]", // Teal
      "bg-[#FF9800]", // Orange
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 select-none items-center justify-center rounded-full text-[#f2f3f5] font-medium transition-all duration-200",
        src ? "bg-[#313338]" : getAvatarBg(username),
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={username}
          className="h-full w-full rounded-full object-cover"
        />
      ) : (
        initials
      )}

      {status !== "none" && (
        <span
          className={cn(
            "absolute rounded-full",
            statusColorClasses[status],
            statusSizeClasses[size],
            borderColor
          )}
        />
      )}
    </div>
  )
}
