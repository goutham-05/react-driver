import { useEffect, useRef } from "react";
import { useTourContext } from "./TourContext";
import { useTour } from "./useTour";
import type { TourConfig, TourControls } from "./types";

/**
 * Register a named tour with `TourProvider` and return its controls.
 * Any component can then call `useTourControls(id)` to start it without
 * prop drilling — useful for onboarding flows that span the whole app.
 *
 * Requires `<TourProvider>` to be mounted above this component.
 *
 * @example
 * // Register in your layout
 * useRegisterTour("onboarding", {
 *   steps: [...],
 *   id: "onboarding",
 *   persist: true,
 * });
 *
 * // Start from anywhere in the tree
 * const controls = useTourControls("onboarding");
 * <button onClick={() => controls?.start()}>Take the tour</button>
 */
export function useRegisterTour(id: string, config: TourConfig): TourControls {
  const ctx = useTourContext();
  const controls = useTour({ ...config, id });

  // Keep a ref to the latest controls so the effect can read it without
  // including the controls object in deps (which changes on every render).
  const controlsRef = useRef(controls);
  controlsRef.current = controls;

  useEffect(() => {
    ctx?.registerTour(id, controlsRef.current);
    return () => { ctx?.unregisterTour(id); };
  // Re-register only when the id or the (stable) register/unregister functions change.
  // Including controls in deps would re-run every render and cause an infinite loop
  // because registerTour bumps the context version, triggering re-renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, ctx?.registerTour, ctx?.unregisterTour]);

  return controls;
}

/**
 * Get the controls for a tour registered elsewhere via `useRegisterTour`.
 * Returns `null` if `TourProvider` is not mounted or the tour hasn't been
 * registered yet.
 *
 * @example
 * const tour = useTourControls("onboarding");
 * <button onClick={() => tour?.start()}>Start tour</button>
 */
export function useTourControls(id: string): TourControls | null {
  const ctx = useTourContext();
  return ctx?.registry.get(id) ?? null;
}
