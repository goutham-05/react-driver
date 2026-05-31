import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTourControls } from "./useRegisterTour";

interface TourBeaconProps {
  /** CSS selector or React ref of the element to attach the beacon to. */
  target: string | React.RefObject<Element | null>;
  /** ID of the tour to start (must be registered via useRegisterTour). */
  tourId: string;
  /** Step index to start the tour from. Default: 0. */
  startStep?: number;
  /** Where to position the beacon relative to the element. Default: "top-right". */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  /** Extra CSS class name for custom styling. */
  className?: string;
}

const OFFSETS: Record<NonNullable<TourBeaconProps["position"]>, (r: DOMRect) => { top: number; left: number }> = {
  "top-right":    r => ({ top: r.top  + window.scrollY - 6,  left: r.right  + window.scrollX - 6  }),
  "top-left":     r => ({ top: r.top  + window.scrollY - 6,  left: r.left   + window.scrollX - 6  }),
  "bottom-right": r => ({ top: r.bottom + window.scrollY - 6, left: r.right + window.scrollX - 6  }),
  "bottom-left":  r => ({ top: r.bottom + window.scrollY - 6, left: r.left  + window.scrollX - 6  }),
};

/**
 * Renders a pulsing beacon dot on a target element to draw attention to a tour
 * without starting it immediately. Clicking the beacon starts the tour.
 *
 * Requires `<TourProvider>` and the tour to be registered via `useRegisterTour`.
 *
 * @example
 * useRegisterTour("feature-x", featureXConfig);
 *
 * <TourBeacon target="#new-dashboard" tourId="feature-x" />
 */
export function TourBeacon({
  target,
  tourId,
  startStep = 0,
  position = "top-right",
  className,
}: TourBeaconProps) {
  const controls = useTourControls(tourId);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const observerRef = useRef<ResizeObserver | null>(null);

  useEffect(() => {
    const resolve = () => typeof target === "string"
      ? document.querySelector(target)
      : target.current;

    const updatePos = () => {
      const el = resolve();
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setPos(OFFSETS[position](rect));
    };

    updatePos();

    // Re-position when the target resizes or the window scrolls.
    observerRef.current = new ResizeObserver(updatePos);
    const el = resolve();
    if (el) observerRef.current.observe(el);
    window.addEventListener("scroll", updatePos, { passive: true });
    window.addEventListener("resize", updatePos, { passive: true });

    return () => {
      observerRef.current?.disconnect();
      window.removeEventListener("scroll", updatePos);
      window.removeEventListener("resize", updatePos);
    };
  }, [target, position]);

  if (!pos || !controls || typeof document === "undefined") return null;

  return createPortal(
    <button
      onClick={() => controls.start(startStep)}
      aria-label="Start tour"
      className={className}
      style={{
        position: "absolute",
        top: pos.top,
        left: pos.left,
        width: 14,
        height: 14,
        border: "none",
        borderRadius: "50%",
        background: "#3b82f6",
        cursor: "pointer",
        padding: 0,
        zIndex: 9999,
        boxShadow: "0 0 0 0 rgba(59,130,246,0.7)",
        animation: "tour-beacon-pulse 1.8s ease-out infinite",
      }}
    />,
    document.body
  );
}

// Inject the keyframe animation once (browser only).
if (typeof document !== "undefined" && typeof window !== "undefined") {
  const id = "tour-beacon-style";
  if (!document.getElementById(id)) {
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      @keyframes tour-beacon-pulse {
        0%   { box-shadow: 0 0 0 0 rgba(59,130,246,0.7); }
        70%  { box-shadow: 0 0 0 10px rgba(59,130,246,0); }
        100% { box-shadow: 0 0 0 0 rgba(59,130,246,0); }
      }
    `;
    document.head.appendChild(style);
  }
}
