import React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { flushSync } from "react-dom";
import { driver } from "driver.js";
import type { Config, DriveStep } from "driver.js";
import { useTourContext } from "./TourContext";
import { waitForElement } from "./waitForElement";
import {
  hasSeenTour, markTourSeen, saveProgress, loadProgress, clearProgress,
  getVisitCount, incrementVisitCount, getShownCount, incrementShownCount,
} from "./persistence";
import type { TourConfig, TourControls, TourStep, StepExitReason } from "./types";

let tourCounter = 0;

function resolveTarget(target: TourStep["target"]): string | Element | undefined {
  if (!target) return undefined;
  if (typeof target === "string") return target;
  return target.current ?? undefined;
}

function isReactNode(value: unknown): boolean {
  return (
    React.isValidElement(value) ||
    (typeof value === "object" && value !== null && !Array.isArray(value))
  );
}

/** Render a ReactNode into a DOM element synchronously using flushSync. */
function renderNode(node: React.ReactNode, el: HTMLElement): () => void {
  el.innerHTML = "";
  const root = createRoot(el);
  flushSync(() => root.render(node as React.ReactElement));
  return () => { try { root.unmount(); } catch {} };
}

/**
 * Build driver.js DriveStep array from TourStep config.
 * Steps with `visibleWhen` returning false are filtered out.
 * Steps with ReactNode content use `onPopoverRender` to inject React.
 * Returns both the filtered driver steps and an index map
 * (driverIndex → originalIndex) for step-level callbacks.
 */
function buildDriverSteps(steps: TourStep[], breakpoint = 768): {
  driveSteps: DriveStep[];
  indexMap: number[];
  popoverCleanups: Map<number, () => void>;
} {
  const driveSteps: DriveStep[] = [];
  const indexMap: number[] = [];
  const popoverCleanups = new Map<number, () => void>();
  const isMobile = typeof window !== "undefined" && window.innerWidth < breakpoint;

  steps.forEach((rawStep, originalIdx) => {
    if (rawStep.visibleWhen) {
      const visible = rawStep.visibleWhen();
      if (!visible) return;
    }

    // Apply mobileOverrides when on a narrow viewport.
    const step: TourStep = (isMobile && rawStep.mobileOverrides)
      ? { ...rawStep, ...rawStep.mobileOverrides }
      : rawStep;

    const driverIdx = driveSteps.length;

    const hasReactTitle   = step.title   !== undefined && typeof step.title   !== "string";
    const hasReactContent = step.content !== undefined && typeof step.content !== "string";

    const driveStep: DriveStep = {
      element: resolveTarget(step.target),
      popover: {
        title:       typeof step.title   === "string" ? step.title   : (hasReactTitle   ? " " : undefined),
        description: typeof step.content === "string" ? step.content : (hasReactContent ? " " : ""),
        side:        step.side,
        align:       step.align,
        ...(step.popoverClass && { popoverClass: step.popoverClass }),
        // per-step highlightPadding via onHighlightStarted callback workaround.
        ...(step.highlightPadding !== undefined ? {
          onHighlightStarted: (_el: Element | undefined, _step: DriveStep, { config: c }: any) => {
            (c as any).stagePadding = step.highlightPadding;
          },
        } : {}),
        // popoverless: hide title/description but keep the navigation footer
        // as a compact pill so the user can still advance or close the tour.
        ...(step.popoverless ? {
          onPopoverRender: (popover: any) => {
            popover.title.style.display       = "none";
            popover.description.style.display = "none";
            popover.closeButton.style.display = "none";
            Object.assign(popover.wrapper.style, {
              background:   "rgba(0,0,0,0.75)",
              borderRadius: "100px",
              padding:      "4px 6px",
              minWidth:     "unset",
              boxShadow:    "0 4px 16px rgba(0,0,0,0.4)",
            });
          },
        } :
        // delayBefore: hide the popover wrapper until the delay expires.
        step.delayBefore ? {
          onPopoverRender: (popover: any) => {
            popover.wrapper.style.visibility = "hidden";
            setTimeout(() => { popover.wrapper.style.visibility = "visible"; }, step.delayBefore);
          },
        } : {}),
      },
    };

    if (hasReactTitle || hasReactContent) {
      driveStep.popover!.onPopoverRender = (popover) => {
        const cleanups: Array<() => void> = [];
        if (hasReactContent) {
          cleanups.push(renderNode(step.content, popover.description));
        }
        if (hasReactTitle) {
          cleanups.push(renderNode(step.title as React.ReactNode, popover.title));
        }
        popoverCleanups.set(driverIdx, () => cleanups.forEach(fn => fn()));
      };
    }

    driveSteps.push(driveStep);
    indexMap.push(originalIdx);
  });

  return { driveSteps, indexMap, popoverCleanups };
}

/**
 * Define a guided tour and get back controls to start, stop, and navigate it.
 *
 * @example
 * const { start } = useTour({
 *   steps: [
 *     { target: "#save-btn", title: "Save", content: "Click here to save." },
 *     { target: "#share-btn", title: <strong>Share</strong>, content: <RichContent /> },
 *   ],
 *   id: "onboarding-v1",
 *   persist: true,           // won't re-show after first completion
 *   onFinish: () => console.log("Done!"),
 * });
 */
export function useTour(config: TourConfig): TourControls {
  const ctx = useTourContext();

  const tourId = useRef(`tour_${++tourCounter}`);
  const configRef = useRef(config);
  configRef.current = config;

  const driverRef               = useRef<ReturnType<typeof driver> | null>(null);
  const advanceOnCleanupRef     = useRef<(() => void) | null>(null);
  const autoAdvanceTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const customPopoverRootRef    = useRef<{ unmount: () => void } | null>(null);
  const keyboardCleanupRef      = useRef<(() => void) | null>(null);
  // Accessibility: remember which element had focus before the tour started
  // so we can restore it when the tour ends.
  const preTourFocusRef         = useRef<HTMLElement | null>(null);
  const prevStepIdxRef       = useRef<number | null>(null);
  const indexMapRef          = useRef<number[]>([]);
  const popoverCleanupsRef   = useRef<Map<number, () => void>>(new Map());
  const stepEnteredAtRef     = useRef<number | null>(null);
  const exitReasonRef        = useRef<StepExitReason | null>(null);
  const [isActive, setIsActive]       = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [totalSteps, setTotalSteps]   = useState(0);

  const cleanupPopovers = useCallback(() => {
    popoverCleanupsRef.current.forEach(fn => fn());
    popoverCleanupsRef.current.clear();
  }, []);

  const clearAutoAdvanceTimer = useCallback(() => {
    if (autoAdvanceTimerRef.current !== null) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    advanceOnCleanupRef.current?.();
    advanceOnCleanupRef.current = null;
    keyboardCleanupRef.current?.();
    keyboardCleanupRef.current = null;
    prevStepIdxRef.current = null;
    stepEnteredAtRef.current = null;
    exitReasonRef.current = null;
    clearAutoAdvanceTimer();
    customPopoverRootRef.current?.unmount();
    customPopoverRootRef.current = null;
    cleanupPopovers();
    driverRef.current?.destroy();
    driverRef.current = null;
    setIsActive(false);
    setCurrentStep(0);
    ctx?.setActiveTourId(null);
  }, [ctx, cleanupPopovers, clearAutoAdvanceTimer]);

  const start = useCallback(
    (stepIndex = 0) => {
      const cfg = configRef.current;

      // Persistence check — skip if already completed (version-aware).
      if (cfg.id && cfg.persist && hasSeenTour(cfg.id, cfg.persist, cfg.version)) return;

      // onBeforeStart guard — abort if the async check returns false.
      if (cfg.onBeforeStart) {
        Promise.resolve(cfg.onBeforeStart()).then(ok => {
          if (ok !== false) _doStart(stepIndex);
        });
        return;
      }
      _doStart(stepIndex);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctx, cleanupPopovers, clearAutoAdvanceTimer]
  );

  // Internal start implementation — separated so onBeforeStart can call it async.
  const _doStart = useCallback(
    async (stepIndex = 0) => {
      const cfg = configRef.current;

      // Fetch remote steps if stepsUrl is configured.
      let steps = cfg.steps;
      if (cfg.stepsUrl) {
        try {
          const data = await fetch(cfg.stepsUrl).then(r => r.json());
          steps = cfg.stepsTransform ? cfg.stepsTransform(data) : (data as typeof steps);
        } catch (e) {
          const err = e instanceof Error ? e : new Error(String(e));
          cfg.onError?.(err, "stepsUrl");
          console.error("[react-driver] Failed to load steps from stepsUrl:", err.message);
          return;
        }
      }

      // showCount check — skip if already shown N or more times.
      if (cfg.id && cfg.showCount !== undefined) {
        const shown = getShownCount(cfg.id);
        if (shown >= cfg.showCount) return;
        incrementShownCount(cfg.id);
      }

      // waitForIdle — defer start to browser idle time.
      if (cfg.waitForIdle) {
        const timeout = typeof cfg.waitForIdle === "number" ? cfg.waitForIdle : 2000;
        await new Promise<void>(resolve => {
          if (typeof requestIdleCallback !== "undefined") {
            requestIdleCallback(() => resolve(), { timeout });
          } else {
            setTimeout(resolve, 0);
          }
        });
      }

      // Resume from saved progress if persistProgress is set.
      if (cfg.persistProgress && cfg.id) {
        const persist = cfg.persist ?? true;
        const saved = loadProgress(cfg.id, persist);
        if (saved !== null && stepIndex === 0) {
          stepIndex = saved;
        }
      }

      const { driveSteps, indexMap, popoverCleanups } = buildDriverSteps(steps, cfg.breakpoint);
      if (driveSteps.length === 0) return;

      indexMapRef.current = indexMap;
      popoverCleanupsRef.current = popoverCleanups;
      driverRef.current?.destroy();

      const waitForTarget = async (target: TourStep["target"]) => {
        if (typeof target === "string") {
          try { await waitForElement(target, configRef.current.waitForTarget ?? 5000); }
          catch (e) {
            const err = e instanceof Error ? e : new Error(String(e));
            configRef.current.onError?.(err, `waitForTarget: "${target}"`);
            console.warn("[react-driver]", err.message);
          }
          await new Promise<void>((res) => setTimeout(res, 0));
        }
      };

      // originalStepAt returns the TourStep for a given driver.js step index.
      const originalStepAt = (driverIdx: number): TourStep | undefined =>
        configRef.current.steps[indexMapRef.current[driverIdx]];

      const advanceStep = (d: ReturnType<typeof driver>, driverIdx: number) => {
        if (d.isLastStep()) { exitReasonRef.current = "close"; d.destroy(); return; }
        const stepCfg     = originalStepAt(driverIdx);
        const nextDriverIdx = driverIdx + 1;
        const nextStepCfg = originalStepAt(nextDriverIdx);
        const proceed = async () => {
          // canAdvance guard — abort silently if the step says not ready
          if (stepCfg?.canAdvance) {
            const ok = await Promise.resolve(stepCfg.canAdvance());
            if (!ok) return;
          }
          // delayAfter — wait before advancing (e.g. let exit animation finish)
          if (stepCfg?.delayAfter) {
            await new Promise<void>(r => setTimeout(r, stepCfg.delayAfter));
          }
          clearAutoAdvanceTimer();
          exitReasonRef.current = "next";
          await waitForTarget(nextStepCfg?.target);
          d.moveNext();
        };
        stepCfg?.beforeNext
          ? Promise.resolve(stepCfg.beforeNext()).then(proceed).catch(() => d.moveNext())
          : proceed();
      };

      const retreatStep = (d: ReturnType<typeof driver>, driverIdx: number) => {
        if (d.isFirstStep()) return;
        const stepCfg     = originalStepAt(driverIdx);
        const prevDriverIdx = driverIdx - 1;
        const prevStepCfg = originalStepAt(prevDriverIdx);
        const proceed = async () => {
          clearAutoAdvanceTimer();
          exitReasonRef.current = "prev";
          await waitForTarget(prevStepCfg?.target);
          d.movePrevious();
        };
        stepCfg?.beforePrev
          ? Promise.resolve(stepCfg.beforePrev()).then(proceed).catch(() => d.movePrevious())
          : proceed();
      };

      const driverConfig: Config = {
        showProgress: cfg.showProgress ?? true,
        animate:      cfg.animate      ?? true,
        overlayOpacity: cfg.overlayOpacity ?? 0.75,
        allowClose:   cfg.allowClose   ?? true,
        ...(cfg.overlayClass && { overlayClass: cfg.overlayClass }),
        ...(cfg.popoverClass && { popoverClass: cfg.popoverClass }),
        prevBtnText: cfg.prevBtnText ?? "← Back",
        nextBtnText: cfg.nextBtnText ?? "Next →",
        doneBtnText: cfg.doneBtnText ?? "Done",
        // highlightPadding — space between element and overlay cutout.
        ...(cfg.highlightPadding !== undefined ? { stagePadding: cfg.highlightPadding } : {}),
        // keyboard config — disable driver.js's built-in keyboard handling when
        // we're overriding keys, so our listener is the sole handler.
        ...(cfg.keyboard?.enabled === false || cfg.keyboard?.next || cfg.keyboard?.prev || cfg.keyboard?.close
          ? { allowKeyboardControl: false }
          : {}),
        // scrollBehavior maps to driver.js's smoothScroll option.
        ...(cfg.scrollBehavior === false
          ? { scrollIntoViewOptions: false as unknown as ScrollIntoViewOptions }
          : cfg.scrollBehavior === "instant"
          ? { scrollIntoViewOptions: { behavior: "instant" as ScrollBehavior } }
          : {}
        ),

        // onPopoverRender fires synchronously when driver.js creates the popover DOM —
        // before any animation starts. Injecting renderPopover here means the custom
        // component is visible from frame 0 with zero flash of driver.js's default UI.
        ...(cfg.renderPopover ? {
          onPopoverRender: (popover: any, opts: any) => {
            const driverIdx = opts?.state?.activeIndex ?? 0;
            const stepCfg   = originalStepAt(driverIdx);
            if (!stepCfg) return;
            popover.wrapper.innerHTML = "";
            customPopoverRootRef.current?.unmount();
            const root = createRoot(popover.wrapper);
            customPopoverRootRef.current = root;
            flushSync(() => root.render(
              React.createElement(configRef.current.renderPopover!, {
                step:       stepCfg,
                stepIndex:  driverIdx,
                totalSteps: indexMapRef.current.length,
                next:  () => driverRef.current?.moveNext(),
                prev:  () => driverRef.current?.movePrevious(),
                stop:  () => stop(),
                isFirst: driverRef.current?.isFirstStep() ?? false,
                isLast:  driverRef.current?.isLastStep()  ?? false,
              })
            ));
          },
        } : {}),

        onHighlightStarted: (_el, _step, { state }) => {
          const driverIdx = state.activeIndex ?? 0;
          setCurrentStep(driverIdx);
          cfg.onStepChange?.(driverIdx);
          if (cfg.persistProgress && cfg.id) {
            saveProgress(cfg.id, driverIdx, cfg.persist ?? true);
          }
          originalStepAt(driverIdx)?.onBeforeHighlight?.();
        },

        onHighlighted: (_el, _step, { state, driver: d }) => {
          const driverIdx = state.activeIndex ?? 0;

          // Set data-tour-step on the active element so tests (and consumers)
          // can wait for a DOM signal instead of relying on timing.
          // driver.js adds driver-active-element; we add data-tour-step as the
          // "ready" signal that fires only after the 400ms animation completes.
          if (_el) (_el as HTMLElement).setAttribute("data-tour-step", String(driverIdx));

          // Fire afterNext/afterPrev on the step we just left — safe here because
          // onHighlighted fires only after driver.js's full 400ms animation.
          const prev = prevStepIdxRef.current;
          if (prev !== null && prev !== driverIdx) {
            const prevStep = originalStepAt(prev);
            driverIdx > prev ? prevStep?.afterNext?.() : prevStep?.afterPrev?.();
          }
          prevStepIdxRef.current = driverIdx;

          // Analytics — record entry time and fire onStepEnter.
          stepEnteredAtRef.current = Date.now();
          const stepCfg = originalStepAt(driverIdx);
          if (configRef.current.debug) {
            console.log(`[react-driver] step ${driverIdx} highlighted`, stepCfg);
          }
          if (stepCfg) {
            configRef.current.onStepEnter?.(driverIdx, { enteredAt: stepEnteredAtRef.current, step: stepCfg });
          }

          stepCfg?.onAfterHighlight?.();

          // Auto-advance — set a timer to move forward after N ms.
          if (stepCfg?.autoAdvanceAfter) {
            autoAdvanceTimerRef.current = setTimeout(() => {
              autoAdvanceTimerRef.current = null;
              advanceStep(d, driverIdx);
            }, stepCfg.autoAdvanceAfter);
          }

          if (stepCfg?.advanceOn) {
            const selector = stepCfg.advanceOn;
            const handleClick = (e: Event) => {
              if ((e.target as Element).closest(selector)) {
                e.stopPropagation();
                advanceOnCleanupRef.current?.();
                advanceOnCleanupRef.current = null;
                advanceStep(d, driverIdx);
              }
            };
            document.addEventListener("click", handleClick, true);
            advanceOnCleanupRef.current = () =>
              document.removeEventListener("click", handleClick, true);
          }
        },

        onDeselected: (_el, _step, { state }) => {
          if (_el) (_el as HTMLElement).removeAttribute("data-tour-step");
          advanceOnCleanupRef.current?.();
          advanceOnCleanupRef.current = null;
          clearAutoAdvanceTimer();
          const driverIdx = state.activeIndex ?? 0;
          // Analytics — fire onStepExit with duration and reason.
          const exitStep = originalStepAt(driverIdx);
          if (exitStep && stepEnteredAtRef.current !== null) {
            const duration = Date.now() - stepEnteredAtRef.current;
            const reason   = exitReasonRef.current ?? "next";
            if (configRef.current.debug) {
              console.log(`[react-driver] step ${driverIdx} exited (${reason}, ${duration}ms)`, exitStep);
            }
            configRef.current.onStepExit?.(driverIdx, { duration, reason, step: exitStep });
          }
          customPopoverRootRef.current?.unmount();
          customPopoverRootRef.current = null;
          exitReasonRef.current   = null;
          stepEnteredAtRef.current = null;
          // Clean up any React root rendered into this step's popover.
          popoverCleanupsRef.current.get(driverIdx)?.();
          popoverCleanupsRef.current.delete(driverIdx);
          exitStep?.onDeselected?.();
        },

        onNextClick: (_el, _step, { driver: d }) => advanceStep(d, d.getActiveIndex() ?? 0),
        onPrevClick: (_el, _step, { driver: d }) => retreatStep(d, d.getActiveIndex() ?? 0),

        onDestroyStarted: (_el, _step, { driver: d }) => {
          if (d.isLastStep()) {
            exitReasonRef.current = "close";
            if (cfg.debug) console.log("[react-driver] tour finished");
            cfg.onFinish?.();
            if (cfg.id && cfg.persist) markTourSeen(cfg.id, cfg.persist, cfg.version);
            if (cfg.id && cfg.persistProgress) clearProgress(cfg.id, cfg.persist ?? true);
          } else {
            exitReasonRef.current = "skip";
            if (cfg.debug) console.log("[react-driver] tour skipped");
            cfg.onSkip?.();
          }
          d.destroy();
        },

        onDestroyed: () => {
          advanceOnCleanupRef.current?.();
          advanceOnCleanupRef.current = null;
          keyboardCleanupRef.current?.();
          keyboardCleanupRef.current = null;
          prevStepIdxRef.current = null;
          stepEnteredAtRef.current = null;
          exitReasonRef.current = null;
          clearAutoAdvanceTimer();
          cleanupPopovers();
          // Accessibility: restore focus to the element that had it before the tour.
          preTourFocusRef.current?.focus?.();
          preTourFocusRef.current = null;
          setIsActive(false);
          setCurrentStep(0);
          ctx?.setActiveTourId(null);
        },

        steps: driveSteps,
      };

      const driverObj = driver(driverConfig);
      driverRef.current = driverObj;
      setTotalSteps(driveSteps.length);
      setIsActive(true);
      ctx?.setActiveTourId(tourId.current);
      cfg.onStart?.();
      // Custom keyboard remapping — intercept before driver.js sees the key.
      if (typeof window !== "undefined" && cfg.keyboard &&
          (cfg.keyboard.next || cfg.keyboard.prev || cfg.keyboard.close)) {
        const kb = cfg.keyboard;
        const handleKey = (e: KeyboardEvent) => {
          const d = driverRef.current;
          if (!d) return;
          if (kb.next  && e.key === kb.next)  { e.stopPropagation(); e.preventDefault(); advanceStep(d, d.getActiveIndex() ?? 0); }
          if (kb.prev  && e.key === kb.prev)  { e.stopPropagation(); e.preventDefault(); retreatStep(d, d.getActiveIndex() ?? 0); }
          if (kb.close && e.key === kb.close) { e.stopPropagation(); e.preventDefault(); d.destroy(); }
        };
        window.addEventListener("keydown", handleKey, true);
        keyboardCleanupRef.current = () => window.removeEventListener("keydown", handleKey, true);
      }

      // Accessibility: capture current focus so we can restore it on tour end.
      if (typeof document !== "undefined") {
        preTourFocusRef.current = document.activeElement as HTMLElement | null;
      }
      if (cfg.debug) console.log(`[react-driver] tour started (step ${stepIndex})`);
      driverObj.drive(stepIndex);
    },
    [ctx, cleanupPopovers, clearAutoAdvanceTimer]
  );

  const next    = useCallback(() => driverRef.current?.moveNext(),     []);
  const prev    = useCallback(() => driverRef.current?.movePrevious(), []);
  const moveTo  = useCallback((idx: number) => driverRef.current?.moveTo(idx), []);
  const restart = useCallback(() => start(0), [start]);

  // showAfter: track visits and auto-start when conditions are met.
  useEffect(() => {
    const cfg = configRef.current;
    if (!cfg.showAfter && !cfg.id) return;

    // Increment visit count on mount.
    if (cfg.id && cfg.showAfter?.visits !== undefined) {
      incrementVisitCount(cfg.id);
    }

    if (!cfg.showAfter) return;
    const { delay = 0, visits, date } = cfg.showAfter;

    // Date condition
    if (date && new Date() < new Date(date)) return;

    // Visits condition
    if (visits !== undefined && cfg.id) {
      const count = getVisitCount(cfg.id);
      if (count < visits) return;
    }

    const timer = setTimeout(() => { start(0); }, delay);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => {
      clearAutoAdvanceTimer();
      driverRef.current?.destroy();
    };
  }, [clearAutoAdvanceTimer]);

  return { start, stop, restart, next, prev, moveTo, isActive, currentStep, totalSteps };
}
