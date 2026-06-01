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

  // Subscribe to data-tour-step attribute changes. attributeFilter ensures
  // the observer only fires for this one attribute — NOT for every DOM mutation.
  // We read the value directly from the mutation record to avoid a querySelector.
  useEffect(() => {
    if (typeof document === "undefined") return;

    // Seed initial state in case a tour is already running when this mounts.
    const existing = document.querySelector<HTMLElement>("[data-tour-step]");
    if (existing) {
      const idx = Number(existing.getAttribute("data-tour-step"));
      setActiveStepIndex(isNaN(idx) ? null : idx);
    }

    const observer = new MutationObserver((mutations) => {
      for (const mut of mutations) {
        const el = mut.target as HTMLElement;
        const raw = el.getAttribute("data-tour-step");
        if (raw !== null) {
          const idx = Number(raw);
          setActiveStepIndex(isNaN(idx) ? null : idx);
        } else {
          setActiveStepIndex(null);
        }
        return; // only one element carries data-tour-step at a time
      }
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["data-tour-step"], // fires ONLY for this attribute
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
