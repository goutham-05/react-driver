import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { ReactNode } from "react";

interface TourTooltipProps {
  /** CSS selector or React ref of the element to attach the tooltip to. */
  target: string | React.RefObject<Element | null>;
  /** Tooltip content. Accepts any ReactNode. */
  content: ReactNode;
  /** Optional title shown above the content. */
  title?: ReactNode;
  /** When to show the tooltip. Default: "hover". */
  trigger?: "hover" | "always" | "click";
  /** Which side of the element to position the tooltip. Default: "top". */
  side?: "top" | "bottom" | "left" | "right";
  /** Extra CSS class on the tooltip container. */
  className?: string;
  /** Callback when the user dismisses the tooltip (click trigger). */
  onDismiss?: () => void;
}

const SIDE_STYLES: Record<NonNullable<TourTooltipProps["side"]>, (r: DOMRect) => React.CSSProperties> = {
  top:    r => ({ bottom: window.innerHeight - r.top  + window.scrollY + 8, left: r.left + window.scrollX + r.width / 2 }),
  bottom: r => ({ top:    r.bottom + window.scrollY + 8,                    left: r.left + window.scrollX + r.width / 2 }),
  left:   r => ({ top:    r.top + window.scrollY + r.height / 2,            right: window.innerWidth - r.left + window.scrollX + 8 }),
  right:  r => ({ top:    r.top + window.scrollY + r.height / 2,            left:  r.right + window.scrollX + 8 }),
};

/**
 * A lightweight, non-intrusive tooltip — no overlay, no darkening.
 * Unlike a full tour, it attaches to a single element and shows contextual
 * help on hover, always, or on click.
 *
 * @example
 * <TourTooltip target="#help-icon" content="Click for help." trigger="hover" />
 * <TourTooltip target="#new-badge" title="New!" content="Check out this feature." trigger="always" />
 */
export function TourTooltip({
  target,
  content,
  title,
  trigger = "hover",
  side = "top",
  className,
  onDismiss,
}: TourTooltipProps) {
  const [visible, setVisible] = useState(trigger === "always");
  const [pos, setPos] = useState<React.CSSProperties>({});
  const observerRef = useRef<ResizeObserver | null>(null);

  const resolve = () => {
    if (typeof target === "string") return document.querySelector(target) as HTMLElement | null;
    return target.current as HTMLElement | null;
  };

  const updatePos = () => {
    const el = resolve();
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos(SIDE_STYLES[side](rect));
  };

  useEffect(() => {
    if (typeof document === "undefined") return;
    const el = resolve();
    if (!el) return;

    updatePos();

    observerRef.current = new ResizeObserver(updatePos);
    observerRef.current.observe(el);
    window.addEventListener("scroll", updatePos, { passive: true });
    window.addEventListener("resize", updatePos, { passive: true });

    if (trigger === "hover") {
      el.addEventListener("mouseenter", () => setVisible(true));
      el.addEventListener("mouseleave", () => setVisible(false));
    }
    if (trigger === "click") {
      el.addEventListener("click", () => setVisible(v => !v));
    }

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener("scroll", updatePos);
      window.removeEventListener("resize", updatePos);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trigger, side]);

  if (!visible || typeof document === "undefined") return null;

  const isHorizontal = side === "left" || side === "right";

  return createPortal(
    <div
      className={className}
      role="tooltip"
      style={{
        position: "absolute",
        zIndex: 9998,
        background: "#1e293b",
        color: "#f8fafc",
        borderRadius: 8,
        padding: "8px 12px",
        fontSize: 13,
        maxWidth: 240,
        boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
        transform: isHorizontal ? "translateY(-50%)" : "translateX(-50%)",
        pointerEvents: trigger === "always" ? "auto" : "none",
        ...pos,
      }}
    >
      {title && <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>}
      <div>{content}</div>
      {trigger === "always" && onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            position: "absolute", top: 6, right: 8,
            background: "transparent", border: "none",
            color: "#94a3b8", cursor: "pointer", fontSize: 14, lineHeight: 1,
          }}
          aria-label="Dismiss"
        >
          ×
        </button>
      )}
    </div>,
    document.body
  );
}

TourTooltip.displayName = "TourTooltip";
