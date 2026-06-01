import { useCallback, useRef, useState } from "react";
import { useTourContext } from "./TourContext";

/**
 * Chain named tours so they play end-to-end. When one tour finishes or is
 * skipped the next starts automatically. Each tour must first be registered
 * via `useRegisterTour`.
 *
 * Requires `<TourProvider>` to be mounted above this component.
 *
 * @example
 * useRegisterTour("setup",     setupConfig);
 * useRegisterTour("dashboard", dashboardConfig);
 *
 * const { startSequence, stopSequence, currentTour, sequenceActive } =
 *   useTourSequence(["setup", "dashboard"]);
 *
 * <button onClick={startSequence}>Start full onboarding</button>
 */
export function useTourSequence(tourIds: string[]): {
  startSequence:  () => void;
  stopSequence:   () => void;
  currentTour:    string | null;
  sequenceActive: boolean;
} {
  const ctx = useTourContext();
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const indexRef          = useRef(0);
  const activeRef         = useRef(false);
  // Unsubscribe function for the current tour's onComplete listener.
  const unsubscribeRef    = useRef<(() => void) | null>(null);

  const runTourAt = useCallback(
    (idx: number) => {
      if (!activeRef.current || idx >= tourIds.length) {
        activeRef.current = false;
        setCurrentTour(null);
        return;
      }

      const id       = tourIds[idx];
      const controls = ctx?.registry.get(id);
      if (!controls) {
        console.warn(`[react-driver] useTourSequence: tour "${id}" is not registered.`);
        activeRef.current = false;
        setCurrentTour(null);
        return;
      }

      setCurrentTour(id);
      indexRef.current = idx;

      // Subscribe via onComplete BEFORE calling start() so we don't miss a
      // very fast completion. onComplete is specific to THIS tour instance —
      // no risk of reacting to an unrelated tour ending elsewhere in the app.
      unsubscribeRef.current?.(); // clean up any previous listener
      unsubscribeRef.current = controls.onComplete(() => {
        unsubscribeRef.current = null;
        runTourAt(idx + 1);
      });

      controls.start(0);
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
    unsubscribeRef.current?.();
    unsubscribeRef.current = null;
    const id = tourIds[indexRef.current];
    ctx?.registry.get(id)?.stop();
    setCurrentTour(null);
  }, [tourIds, ctx]);

  return { startSequence, stopSequence, currentTour, sequenceActive: currentTour !== null };
}
