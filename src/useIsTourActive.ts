import { useTourContext } from "./TourContext";

/**
 * Returns `true` when any tour registered inside the nearest `<TourProvider>`
 * is currently running. Useful for gating UI while a tour is in progress.
 *
 * Returns `false` when called outside a `<TourProvider>`.
 *
 * @example
 * function Banner() {
 *   const tourActive = useIsTourActive();
 *   if (tourActive) return null;         // hide banner during tours
 *   return <ProBanner />;
 * }
 */
export function useIsTourActive(): boolean {
  const ctx = useTourContext();
  return ctx?.activeTourId !== null && ctx?.activeTourId !== undefined;
}
