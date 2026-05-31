const KEY_PREFIX      = "react-driver:";
const PROGRESS_PREFIX = "react-driver:progress:";

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
