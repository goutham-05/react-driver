import { useCallback, useEffect, useRef, useState } from "react";
import { driver } from "driver.js";
import type { Config, DriveStep } from "driver.js";
import { useTourContext } from "./TourContext";
import type { TourConfig, TourControls, TourStep } from "./types";

let tourCounter = 0;

function resolveTarget(target: TourStep["target"]): string | Element | undefined {
  if (!target) return undefined;
  if (typeof target === "string") return target;
  return target.current ?? undefined;
}

function buildDriverSteps(steps: TourStep[]): DriveStep[] {
  return steps.map((step) => ({
    element: resolveTarget(step.target),
    popover: {
      title: step.title,
      description: step.content,
      side: step.side,
      align: step.align,
      ...(step.popoverClass && { popoverClass: step.popoverClass }),
    },
  }));
}

/**
 * Define a guided tour and get back controls to start, stop, and navigate it.
 *
 * @example
 * const { start } = useTour({
 *   steps: [
 *     { target: "#save-btn", title: "Save", content: "Click here to save your work." },
 *     { target: "#share-btn", title: "Share", content: "Invite your team." },
 *   ],
 *   onFinish: () => markOnboardingComplete(),
 * });
 *
 * return <button onClick={() => start()}>Take the tour</button>;
 */
export function useTour(config: TourConfig): TourControls {
  const ctx = useTourContext();

  // Stable id — used to coordinate with TourProvider.
  const tourId = useRef(`tour_${++tourCounter}`);

  // Always close over the latest config without requiring the consumer to memoize.
  const configRef = useRef(config);
  configRef.current = config;

  const driverRef = useRef<ReturnType<typeof driver> | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const stop = useCallback(() => {
    driverRef.current?.destroy();
    driverRef.current = null;
    setIsActive(false);
    setCurrentStep(0);
    ctx?.setActiveTourId(null);
  }, [ctx]);

  const start = useCallback(
    (stepIndex = 0) => {
      const cfg = configRef.current;
      const steps = buildDriverSteps(cfg.steps);
      if (steps.length === 0) return;

      // Destroy any running instance before starting fresh.
      driverRef.current?.destroy();

      const driverConfig: Config = {
        showProgress: cfg.showProgress ?? true,
        animate: cfg.animate ?? true,
        overlayOpacity: cfg.overlayOpacity ?? 0.75,
        allowClose: cfg.allowClose ?? true,
        ...(cfg.overlayClass && { overlayClass: cfg.overlayClass }),
        ...(cfg.popoverClass && { popoverClass: cfg.popoverClass }),
        prevBtnText: cfg.prevBtnText ?? "← Back",
        nextBtnText: cfg.nextBtnText ?? "Next →",
        doneBtnText: cfg.doneBtnText ?? "Done",

        onHighlightStarted: (_el, _step, { state }) => {
          const idx = state.activeIndex ?? 0;
          setCurrentStep(idx);
          cfg.onStepChange?.(idx);
          cfg.steps[idx]?.onBeforeHighlight?.();
        },

        onHighlighted: (_el, _step, { state }) => {
          const idx = state.activeIndex ?? 0;
          cfg.steps[idx]?.onAfterHighlight?.();
        },

        onDeselected: (_el, _step, { state }) => {
          const idx = state.activeIndex ?? 0;
          cfg.steps[idx]?.onDeselected?.();
        },

        // onDestroyStarted fires for both "Done" and Escape/overlay-close.
        // Check isLastStep() to distinguish finish from skip.
        onDestroyStarted: (_el, _step, { driver: d }) => {
          if (d.isLastStep()) {
            cfg.onFinish?.();
          } else {
            cfg.onSkip?.();
          }
        },

        onDestroyed: () => {
          setIsActive(false);
          setCurrentStep(0);
          ctx?.setActiveTourId(null);
        },

        steps,
      };

      const driverObj = driver(driverConfig);
      driverRef.current = driverObj;

      setIsActive(true);
      ctx?.setActiveTourId(tourId.current);
      cfg.onStart?.();
      driverObj.drive(stepIndex);
    },
    [ctx]
  );

  const next = useCallback(() => driverRef.current?.moveNext(), []);
  const prev = useCallback(() => driverRef.current?.movePrevious(), []);
  const moveTo = useCallback((idx: number) => driverRef.current?.moveTo(idx), []);

  // Cleanup on unmount.
  useEffect(() => {
    return () => {
      driverRef.current?.destroy();
    };
  }, []);

  return { start, stop, next, prev, moveTo, isActive, currentStep };
}
