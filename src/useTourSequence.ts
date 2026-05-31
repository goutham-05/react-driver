import { useCallback, useRef, useState } from "react";
import { useTourContext } from "./TourContext";
import type { TourControls } from "./types";

/**
 * Chain named tours so they play end-to-end. When one tour finishes the next
 * starts automatically. Each tour must first be registered via `useRegisterTour`.
 *
 * Requires `<TourProvider>` to be mounted above this component.
 *
 * @example
 * // Register individual tours in your layout
 * useRegisterTour("setup",     setupConfig);
 * useRegisterTour("dashboard", dashboardConfig);
 * useRegisterTour("billing",   billingConfig);
 *
 * // Then sequence them
 * const { startSequence, stopSequence, currentTour, sequenceActive } =
 *   useTourSequence(["setup", "dashboard", "billing"]);
 *
 * <button onClick={startSequence}>Start full onboarding</button>
 */
export function useTourSequence(tourIds: string[]): {
  /** Start the sequence from the first tour. */
  startSequence: () => void;
  /** Stop the currently-running tour and clear the sequence. */
  stopSequence: () => void;
  /** ID of the tour currently running, or null. */
  currentTour: string | null;
  /** True while any tour in the sequence is running. */
  sequenceActive: boolean;
} {
  const ctx = useTourContext();
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const indexRef = useRef(0);
  const activeRef = useRef(false);

  const runTourAt = useCallback(
    (idx: number) => {
      if (!activeRef.current || idx >= tourIds.length) {
        activeRef.current = false;
        setCurrentTour(null);
        return;
      }

      const id = tourIds[idx];
      const controls = ctx?.registry.get(id);
      if (!controls) {
        console.warn(`[react-driver] useTourSequence: tour "${id}" is not registered.`);
        activeRef.current = false;
        setCurrentTour(null);
        return;
      }

      setCurrentTour(id);
      indexRef.current = idx;

      // Wrap the registered tour's controls: when it finishes, start the next one.
      // We do this by patching onFinish at call time via a restart-after-finish proxy.
      // Since we don't re-define the tour config here, we rely on the controls'
      // start() and listen via TourProvider's activeTourId becoming null.
      controls.start(0);

      // Poll: when activeTourId clears (the tour ended), advance.
      const poll = setInterval(() => {
        if (!activeRef.current) { clearInterval(poll); return; }
        if (!controls.isActive) {
          clearInterval(poll);
          runTourAt(idx + 1);
        }
      }, 200);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tourIds, ctx]
  );

  const startSequence = useCallback(() => {
    activeRef.current = true;
    runTourAt(0);
  }, [runTourAt]);

  const stopSequence = useCallback(() => {
    activeRef.current = false;
    const id = tourIds[indexRef.current];
    ctx?.registry.get(id)?.stop();
    setCurrentTour(null);
  }, [tourIds, ctx]);

  return { startSequence, stopSequence, currentTour, sequenceActive: currentTour !== null };
}
