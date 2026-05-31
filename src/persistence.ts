const KEY_PREFIX      = "react-driver:";
const PROGRESS_PREFIX = "react-driver:progress:";
const VISITS_PREFIX   = "react-driver:visits:";
const SHOWN_PREFIX    = "react-driver:shown:";

const isBrowser = typeof window !== "undefined";

function store(persist: boolean | "session"): Storage | null {
  if (!isBrowser) return null;
  try {
    return persist === "session" ? sessionStorage : localStorage;
  } catch {
    // Private browsing or storage disabled
    return null;
  }
}

// ── Completion ────────────────────────────────────────────────────────────────

interface CompletionRecord {
  completedAt: number;
  version?: string;
}

/** Returns true when the tour has been completed and the stored version matches. */
export function hasSeenTour(
  id: string,
  persist: boolean | "session" = true,
  version?: string
): boolean {
  try {
    const raw = store(persist)?.getItem(`${KEY_PREFIX}${id}`);
    if (!raw) return false;
    const record: CompletionRecord = JSON.parse(raw);
    // If a version is specified, the stored record must match it exactly.
    if (version !== undefined && record.version !== version) return false;
    return true;
  } catch {
    return false;
  }
}

/** Mark a tour as completed, optionally recording the current version. */
export function markTourSeen(
  id: string,
  persist: boolean | "session",
  version?: string
): void {
  try {
    const record: CompletionRecord = { completedAt: Date.now(), ...(version ? { version } : {}) };
    store(persist)?.setItem(`${KEY_PREFIX}${id}`, JSON.stringify(record));
  } catch {}
}

/**
 * Mark a tour as "seen" / skipped without the user completing it.
 * Useful in admin panels, test environments, or anywhere you want to
 * suppress onboarding without going through all the steps.
 *
 * @example
 * skipTour("onboarding-v1");
 */
export function skipTour(id: string, persist: boolean | "session" = true, version?: string): void {
  markTourSeen(id, persist, version);
}

/**
 * Clear completion history for one tour (or all tours if id is omitted).
 *
 * @example
 * clearTourHistory("onboarding-v1"); // reset one tour
 * clearTourHistory();                // reset all tours
 */
export function clearTourHistory(id?: string): void {
  if (!isBrowser) return;
  try {
    for (const storage of [localStorage, sessionStorage]) {
      if (id) {
        storage.removeItem(`${KEY_PREFIX}${id}`);
        storage.removeItem(`${PROGRESS_PREFIX}${id}`);
      } else {
        Object.keys(storage)
          .filter(k => k.startsWith(KEY_PREFIX) || k.startsWith(PROGRESS_PREFIX))
          .forEach(k => storage.removeItem(k));
      }
    }
  } catch {}
}

// ── Progress ──────────────────────────────────────────────────────────────────

/** Save the current step index so the tour can resume from here. */
export function saveProgress(
  id: string,
  step: number,
  persist: boolean | "session"
): void {
  try {
    store(persist)?.setItem(`${PROGRESS_PREFIX}${id}`, String(step));
  } catch {}
}

/** Load a previously saved step index. Returns null if none is stored. */
export function loadProgress(
  id: string,
  persist: boolean | "session"
): number | null {
  try {
    const raw = store(persist)?.getItem(`${PROGRESS_PREFIX}${id}`);
    if (raw === null) return null;
    const step = Number(raw);
    return isNaN(step) ? null : step;
  } catch {
    return null;
  }
}

/** Clear saved progress (called when a tour finishes). */
export function clearProgress(id: string, persist: boolean | "session"): void {
  try {
    store(persist)?.removeItem(`${PROGRESS_PREFIX}${id}`);
  } catch {}
}

// ── Visit counting (for showAfter.visits) ─────────────────────────────────────

export function getVisitCount(id: string): number {
  try {
    return Number(localStorage.getItem(`${VISITS_PREFIX}${id}`)) || 0;
  } catch { return 0; }
}

export function incrementVisitCount(id: string): number {
  try {
    const next = getVisitCount(id) + 1;
    localStorage.setItem(`${VISITS_PREFIX}${id}`, String(next));
    return next;
  } catch { return 0; }
}

// ── Show count (for showCount) ────────────────────────────────────────────────

export function getShownCount(id: string): number {
  try {
    return Number(localStorage.getItem(`${SHOWN_PREFIX}${id}`)) || 0;
  } catch { return 0; }
}

export function incrementShownCount(id: string): number {
  try {
    const next = getShownCount(id) + 1;
    localStorage.setItem(`${SHOWN_PREFIX}${id}`, String(next));
    return next;
  } catch { return 0; }
}

// ── Tour history (all stored records) ─────────────────────────────────────────

export interface TourHistoryRecord {
  id: string;
  completedAt?: number;
  version?: string;
  currentStep?: number;
  visitCount: number;
  shownCount: number;
}

/** Read all stored tour records from localStorage. */
export function readTourHistory(): TourHistoryRecord[] {
  if (!isBrowser) return [];
  try {
    const records: Record<string, TourHistoryRecord> = {};
    const all = Object.keys(localStorage);
    for (const key of all) {
      // completion
      if (key.startsWith(KEY_PREFIX) && !key.startsWith(`${KEY_PREFIX}progress:`) &&
          !key.startsWith(`${KEY_PREFIX}visits:`) && !key.startsWith(`${KEY_PREFIX}shown:`)) {
        const id = key.slice(KEY_PREFIX.length);
        try {
          const rec = JSON.parse(localStorage.getItem(key) ?? "{}");
          records[id] = { ...(records[id] ?? { id, visitCount: 0, shownCount: 0 }), ...rec };
        } catch {}
      }
      // progress
      if (key.startsWith(PROGRESS_PREFIX)) {
        const id = key.slice(PROGRESS_PREFIX.length);
        const step = Number(localStorage.getItem(key));
        records[id] = { ...(records[id] ?? { id, visitCount: 0, shownCount: 0 }), currentStep: isNaN(step) ? undefined : step };
      }
      // visits
      if (key.startsWith(VISITS_PREFIX)) {
        const id = key.slice(VISITS_PREFIX.length);
        const count = Number(localStorage.getItem(key)) || 0;
        records[id] = { ...(records[id] ?? { id, visitCount: 0, shownCount: 0 }), visitCount: count };
      }
      // shown
      if (key.startsWith(SHOWN_PREFIX)) {
        const id = key.slice(SHOWN_PREFIX.length);
        const count = Number(localStorage.getItem(key)) || 0;
        records[id] = { ...(records[id] ?? { id, visitCount: 0, shownCount: 0 }), shownCount: count };
      }
    }
    // ensure id is set
    return Object.values(records).map(r => {
      const { visitCount = 0, shownCount = 0, ...rest } = r;
      return { visitCount, shownCount, ...rest };
    });
  } catch { return []; }
}
