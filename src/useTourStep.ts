import { useCallback, useEffect, useState } from "react";
import { useTourContext } from "./TourContext";

interface TourStepState {
  /** True when the specified step index is the currently active step. */
  isActive: boolean;
  /** The zero-based index of the currently active step, or null when no tour is running. */
  activeStepIndex: number | null;
}

/**
 * Know from any component whether a specific tour step is currently highlighted.
 * Useful for conditionally styling nav items, showing inline hints, or rendering
 * custom UI that reacts to tour progress.
 *
 * Requires `<TourProvider>` above this component.
 *
 * @param stepIndex - The zero-based step index to watch.
 *
 * @example
 * function NavItem({ label, stepIndex }: { label: string; stepIndex: number }) {
 *   const { isActive } = useTourStep(stepIndex);
 *   return (
 *     <li style={{ outline: isActive ? "2px solid #3b82f6" : "none" }}>
 *       {label}
 *     </li>
 *   );
 * }
 */
export function useTourStep(stepIndex: number): TourStepState {
  const ctx = useTourContext();
  const [activeStepIndex, setActiveStepIndex] = useState<number | null>(null);

  // Subscribe to data-tour-step mutations on the DOM — the library sets this
  // attribute on the active element inside onHighlighted (after animation).
  useEffect(() => {
    if (typeof document === "undefined") return;

    const update = () => {
      const el = document.querySelector("[data-tour-step]");
      if (!el) {
        setActiveStepIndex(null);
        return;
      }
      const idx = Number(el.getAttribute("data-tour-step"));
      setActiveStepIndex(isNaN(idx) ? null : idx);
    };

    update();

    const observer = new MutationObserver(update);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-tour-step"],
      subtree: true,
    });

    return () => observer.disconnect();
  }, []);

  // Also reset when no tour is active in the provider.
  const tourActive = ctx?.activeTourId !== null && ctx?.activeTourId !== undefined;
  const resolvedIndex = tourActive ? activeStepIndex : null;

  return {
    isActive: resolvedIndex === stepIndex,
    activeStepIndex: resolvedIndex,
  };
}
