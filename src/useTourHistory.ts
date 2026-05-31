import { useCallback, useEffect, useState } from "react";
import { readTourHistory, clearTourHistory } from "./persistence";
import type { TourHistoryRecord } from "./persistence";

/**
 * Read all stored tour records from localStorage. Returns a live snapshot
 * plus a `clearAll` utility to wipe everything.
 *
 * Useful for building "your onboarding is 60% complete" UI, admin dashboards,
 * or deciding which tours to surface to a returning user.
 *
 * @example
 * const { records, clearAll } = useTourHistory();
 * const completed = records.filter(r => r.completedAt);
 * const inProgress = records.filter(r => r.currentStep !== undefined);
 */
export function useTourHistory(): {
  records: TourHistoryRecord[];
  clearAll: () => void;
  refresh: () => void;
} {
  const [records, setRecords] = useState<TourHistoryRecord[]>(() => readTourHistory());

  const refresh = useCallback(() => setRecords(readTourHistory()), []);

  const clearAll = useCallback(() => {
    clearTourHistory();
    refresh();
  }, [refresh]);

  // Re-read when the window regains focus (user may have completed a tour in another tab).
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.addEventListener("focus", refresh);
    return () => window.removeEventListener("focus", refresh);
  }, [refresh]);

  return { records, clearAll, refresh };
}
