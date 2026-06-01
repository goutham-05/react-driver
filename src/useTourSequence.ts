import { useCallback, useEffect, useRef, useState } from "react";
import { useTourContext } from "./TourContext";

/**
 * Chain named tours so they play end-to-end. When one tour finishes the next
 * starts automatically. Each tour must first be registered via `useRegisterTour`.
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
  startSequence: () => void;
  stopSequence:  () => void;
  currentTour:   string | null;
  sequenceActive: boolean;
} {
  const ctx = useTourContext();
  const [currentTour, setCurrentTour] = useState<string | null>(null);
  const indexRef    = useRef(0);
  const activeRef   = useRef(false);
  // True while the sequence has a tour running — lets the activeTourId
  // effect know it should advance rather than ignore the change.
  const runningRef  = useRef(false);

  const runTourAt = useCallback(
    (idx: number) => {
      if (!activeRef.current || idx >= tourIds.length) {
        activeRef.current = false;
        runningRef.current = false;
        setCurrentTour(null);
        return;
      }

      const id       = tourIds[idx];
      const controls = ctx?.registry.get(id);
      if (!controls) {
        console.warn(`[react-driver] useTourSequence: tour "${id}" is not registered.`);
        activeRef.current = false;
        runningRef.current = false;
        setCurrentTour(null);
        return;
      }

      setCurrentTour(id);
      indexRef.current  = idx;
      runningRef.current = true;
      controls.start(0);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tourIds, ctx]
  );

  // Event-driven: react to activeTourId becoming null (tour ended) instead of
  // polling. This fires only when context changes, not on a fixed interval.
  useEffect(() => {
    if (!runningRef.current || !activeRef.current) return;
    const tourActive = ctx?.activeTourId !== null && ctx?.activeTourId !== undefined;
    if (!tourActive) {
      runningRef.current = false;
      runTourAt(indexRef.current + 1);
    }
  }, [ctx?.activeTourId, runTourAt]);

  const startSequence = useCallback(() => {
    activeRef.current  = true;
    runTourAt(0);
  }, [runTourAt]);

  const stopSequence = useCallback(() => {
    activeRef.current  = false;
    runningRef.current = false;
    const id = tourIds[indexRef.current];
    ctx?.registry.get(id)?.stop();
    setCurrentTour(null);
  }, [tourIds, ctx]);

  return { startSequence, stopSequence, currentTour, sequenceActive: currentTour !== null };
}
