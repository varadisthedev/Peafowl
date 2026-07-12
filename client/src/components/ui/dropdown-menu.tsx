import * as React from "react"
import { cn } from "@/lib/utils"

export interface DropdownMenuProps {
  trigger: React.ReactNode
  children: React.ReactNode
  align?: "left" | "right"
  className?: string
}

export function DropdownMenu({
  trigger,
  children,
  align = "right",
  className,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 w-48 rounded bg-[#111214] p-1.5 shadow-xl ring-1 ring-black/20 focus:outline-none animate-in fade-in slide-in-from-top-2 duration-100",
            align === "right" ? "right-0 origin-top-right" : "left-0 origin-top-left",
            className
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  variant?: "default" | "danger"
}

export function DropdownMenuItem({
  children,
  variant = "default",
  className,
  ...props
}: DropdownMenuItemProps) {
  return (
    <button
      className={cn(
        "flex w-full items-center rounded px-2 py-2 text-xs font-medium transition-colors text-left",
        variant === "default" && "text-[#b5bac1] hover:bg-[#5865f2] hover:text-white",
        variant === "danger" && "text-[#f23f43] hover:bg-[#f23f43] hover:text-white",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
