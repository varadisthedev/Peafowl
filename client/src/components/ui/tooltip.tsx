import * as React from "react"
import { cn } from "@/lib/utils"

export interface TooltipProps extends React.HTMLAttributes<HTMLDivElement> {
  content: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  children: React.ReactElement
}

export function Tooltip({
  content,
  side = "top",
  children,
  className,
  ...props
}: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const triggerRef = React.useRef<HTMLElement>(null);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    let top = 0;
    let left = 0;

    const spacing = 8;

    switch (side) {
      case "top":
        top = triggerRect.top - tooltipRect.height - spacing + window.scrollY;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2 + window.scrollX;
        break;
      case "bottom":
        top = triggerRect.bottom + spacing + window.scrollY;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2 + window.scrollX;
        break;
      case "left":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2 + window.scrollY;
        left = triggerRect.left - tooltipRect.width - spacing + window.scrollX;
        break;
      case "right":
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2 + window.scrollY;
        left = triggerRect.right + spacing + window.scrollX;
        break;
    }

    setPosition({ top, left });
  }, [isVisible, side]);

  const handleMouseEnter = () => setIsVisible(true);
  const handleMouseLeave = () => setIsVisible(false);

  // Inject mouse listeners to child element
  const triggerElement = React.cloneElement(children, {
    ref: triggerRef,
    onMouseEnter: (e: React.MouseEvent) => {
      handleMouseEnter();
      if (children.props.onMouseEnter) children.props.onMouseEnter(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      handleMouseLeave();
      if (children.props.onMouseLeave) children.props.onMouseLeave(e);
    },
  });

  return (
    <>
      {triggerElement}
      {isVisible && (
        <div
          ref={tooltipRef}
          className={cn(
            "fixed z-50 rounded bg-[#111214] px-3 py-1.5 text-xs font-semibold text-[#f2f3f5] shadow-lg animate-in fade-in zoom-in-95 duration-100 pointer-events-none",
            className
          )}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
          {...props}
        >
          {content}
          
          {/* Tooltip Arrow */}
          <div
            className={cn(
              "absolute h-2 w-2 rotate-45 bg-[#111214]",
              side === "top" && "bottom-[-4px] left-1/2 -translate-x-1/2",
              side === "bottom" && "top-[-4px] left-1/2 -translate-x-1/2",
              side === "left" && "right-[-4px] top-1/2 -translate-y-1/2",
              side === "right" && "left-[-4px] top-1/2 -translate-y-1/2"
            )}
          />
        </div>
      )}
    </>
  );
}
