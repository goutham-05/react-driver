import { useCallback, useRef, useState } from "react";
import { useTour } from "./useTour";
import type { TourConfig, TourControls, StepExitReason } from "./types";

export interface StepRecord {
  stepIndex: number;
  duration: number;
  reason: StepExitReason;
}

export interface TourAnalyticsSummary {
  /** Total number of times the tour has been started in this session. */
  startCount: number;
  /** Whether the tour was fully completed in this session. */
  completed: boolean;
  /** Index of the step where the user dropped off (skipped/closed), or null. */
  dropOffStep: number | null;
  /** Average time (ms) spent on each visible step across all starts. */
  avgTimePerStep: number;
  /** Individual step records for this session, in order. */
  steps: StepRecord[];
  /** Completion rate: (stepsReached / totalSteps) as a 0–1 value. */
  completionRate: number;
  /** Total visible steps in the last run (after visibleWhen filtering). */
  totalSteps: number;
}

/**
 * Wraps `useTour` and automatically aggregates `onStepEnter`/`onStepExit`
 * data into a summary for the current session. Wire `summary` to your
 * analytics backend in the `onFinish` / `onSkip` callbacks.
 *
 * @example
 * const { controls, summary } = useTourAnalytics({
 *   steps: [...],
 *   onFinish: () => analytics.track("tour_complete", summary),
 * });
 */
export function useTourAnalytics(config: TourConfig): {
  controls: TourControls;
  summary: TourAnalyticsSummary;
  resetAnalytics: () => void;
} {
  const stepRecords  = useRef<StepRecord[]>([]);
  // Track totalSteps from onStepChange — set on each step change so it's
  // always live inside the finish/skip callbacks (avoids the stale-closure bug
  // that would occur if we read controls.totalSteps directly inside the closures).
  const totalStepsRef = useRef(0);

  const [summary, setSummary] = useState<TourAnalyticsSummary>({
    startCount: 0, completed: false, dropOffStep: null,
    avgTimePerStep: 0, steps: [], completionRate: 0, totalSteps: 0,
  });

  const rebuild = useCallback((completed: boolean, dropOff: number | null, records: StepRecord[]) => {
    const total = totalStepsRef.current;
    const avg   = records.length > 0
      ? records.reduce((s, r) => s + r.duration, 0) / records.length
      : 0;
    setSummary(prev => ({
      startCount: prev.startCount,
      completed,
      dropOffStep: dropOff,
      avgTimePerStep: Math.round(avg),
      steps: [...records],
      totalSteps: total,
      completionRate: total > 0 ? Math.min(1, records.length / total) : 0,
    }));
  }, []);

  const controls = useTour({
    ...config,
    onStart: () => {
      stepRecords.current  = [];
      totalStepsRef.current = 0;
      setSummary(prev => ({ ...prev, startCount: prev.startCount + 1, completed: false, dropOffStep: null }));
      config.onStart?.();
    },
    onStepChange: (idx) => {
      // Keep totalSteps in sync via the controls ref which IS live by this point.
      // We read it on the next tick to ensure React has flushed the state update.
      setTimeout(() => {
        totalStepsRef.current = controls.totalSteps;
      }, 0);
      config.onStepChange?.(idx);
    },
    onStepExit: (idx, meta) => {
      stepRecords.current.push({ stepIndex: idx, duration: meta.duration, reason: meta.reason });
      config.onStepExit?.(idx, meta);
    },
    onFinish: () => {
      rebuild(true, null, stepRecords.current);
      config.onFinish?.();
    },
    onSkip: () => {
      const last = stepRecords.current.at(-1);
      rebuild(false, last?.stepIndex ?? null, stepRecords.current);
      config.onSkip?.();
    },
  });

  const resetAnalytics = useCallback(() => {
    stepRecords.current   = [];
    totalStepsRef.current = 0;
    setSummary({ startCount: 0, completed: false, dropOffStep: null, avgTimePerStep: 0, steps: [], completionRate: 0, totalSteps: 0 });
  }, []);

  return { controls, summary, resetAnalytics };
}
