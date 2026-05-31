import type { ReactNode, RefObject, FC } from "react";

/** A single step in a guided tour. */
export interface TourStep {
  /** CSS selector or a React ref pointing to the element to highlight. */
  target?: string | RefObject<Element | null>;
  /** Popover heading. Accepts a string or any React node for rich content. */
  title?: ReactNode;
  /**
   * Popover body. Accepts a string or any React node — images, buttons,
   * styled text, videos — anything you can render in React.
   */
  content: ReactNode;
  /** Which side of the element the popover appears on. */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment of the popover relative to the element. */
  align?: "start" | "center" | "end";
  /** Extra CSS class added to this step's popover. */
  popoverClass?: string;
  /**
   * Highlight the element with no popover — pure visual spotlight.
   * Useful for "notice this changed" moments that shouldn't interrupt the user.
   */
  popoverless?: boolean;
  /**
   * Section label for this step. `<TourChecklist>` renders a section header
   * whenever the label changes, grouping steps into logical chapters.
   *
   * @example
   * { section: "Setup", target: "#profile", content: "Fill in your profile." }
   * { section: "Setup", target: "#avatar",  content: "Upload a photo." }
   * { section: "Explore", target: "#dashboard", content: "Your main workspace." }
   */
  section?: string;
  /**
   * Override specific step properties on narrow screens.
   * Applied when `window.innerWidth` is below `TourConfig.breakpoint` (default 768px).
   *
   * @example
   * mobileOverrides: { side: "bottom", content: "Tap here." }
   */
  mobileOverrides?: Partial<Omit<TourStep, "mobileOverrides">>;
  /**
   * Skip this step when the function returns false. Evaluated fresh on
   * every navigation so runtime state (feature flags, user roles, etc.)
   * is always respected.
   *
   * @example
   * visibleWhen: () => user.plan === "free"   // only show upgrade step for free users
   */
  visibleWhen?: () => boolean;
  /**
   * Wait N ms after the user clicks Next before the tour advances. Useful when
   * the highlighted element has an exit animation you want to finish first.
   *
   * @example
   * delayAfter: 300   // let a 250ms fade-out finish before moving on
   */
  delayAfter?: number;
  /**
   * Extra padding (px) between the element and the overlay cutout for this step.
   * Overrides the tour-level `highlightPadding` config for this step only.
   */
  highlightPadding?: number;
  /**
   * Delay (ms) between the element being highlighted and the popover appearing.
   * Useful when the target element enters the DOM via a CSS transition —
   * the highlight shows instantly while the popover waits for the animation.
   *
   * @example
   * delayBefore: 350   // wait for a 300ms slide-in animation to settle
   */
  delayBefore?: number;
  /**
   * Guard the Next button. Called before the tour advances — if it returns
   * (or resolves to) `false` the step stays active and nothing moves.
   * Useful for waiting on required user actions: filling a field, clicking
   * a button, accepting terms, etc.
   *
   * @example
   * canAdvance: () => formRef.current?.checkValidity() ?? true
   */
  canAdvance?: () => boolean | Promise<boolean>;
  /**
   * Automatically advance to the next step after N milliseconds.
   * Any user interaction (clicking Next or an advanceOn element) still
   * works normally — the timer is cancelled as soon as the step changes.
   *
   * @example
   * autoAdvanceAfter: 4000   // move on after 4 seconds
   */
  autoAdvanceAfter?: number;
  /** Called just before this step is highlighted. */
  onBeforeHighlight?: () => void;
  /** Called after this step is fully highlighted. */
  onAfterHighlight?: () => void;
  /** Called when leaving this step. */
  onDeselected?: () => void;
  /**
   * Called after the **next** step's animation fully completes. Safe to
   * unmount this step's DOM elements here — driver.js has already moved on.
   *
   * @example
   * afterNext: () => setMenuOpen(false)
   */
  afterNext?: () => void;
  /**
   * Mirror of `afterNext` for backward navigation.
   *
   * @example
   * afterPrev: () => setActivePanel(null)
   */
  afterPrev?: () => void;
  /**
   * CSS selector — when the matching element is clicked during this step
   * the tour advances exactly like pressing Next.
   *
   * @example
   * advanceOn: "#menu-edit-profile"
   */
  advanceOn?: string;
  /**
   * Called before advancing. Return a Promise to navigate routes and the
   * library will wait for the next step's target to appear in the DOM.
   *
   * @example
   * beforeNext: () => navigate("/cart")
   */
  beforeNext?: () => void | Promise<void>;
  /**
   * Mirror of `beforeNext` for back navigation.
   *
   * @example
   * beforePrev: () => navigate("/products")
   */
  beforePrev?: () => void | Promise<void>;
}

/** Configuration passed to `useTour`. */
export interface TourConfig {
  steps: TourStep[];
  /**
   * Unique identifier for this tour. Required when using `persist`,
   * `useRegisterTour`, or `useTourControls`.
   */
  id?: string;
  /**
   * Show the tour at most N times before it auto-marks as completed. Different
   * from `persist` (all-or-nothing) — useful for re-engagement hints that
   * should surface a few times before giving up.
   *
   * @example
   * showCount: 3   // show up to 3 times then stop
   */
  showCount?: number;
  /**
   * Automatically start the tour when the specified condition is met.
   * All conditions must pass. The tour still respects `persist` / `showCount`.
   *
   * @example
   * showAfter: { delay: 5000 }                // 5 s after mount
   * showAfter: { visits: 3 }                   // on the 3rd page visit
   * showAfter: { date: "2026-09-01" }          // from a release date
   * showAfter: { visits: 2, delay: 3000 }      // 3 s after the 2nd visit
   */
  showAfter?: {
    /** Wait N ms after the component mounts before starting. */
    delay?: number;
    /** Only start from the Nth page-visit onward (tracked in localStorage). */
    visits?: number;
    /** Don't start before this date. */
    date?: string | Date;
  };
  /**
   * Global extra padding (px) between every highlighted element and the
   * overlay cutout. Override per-step with `TourStep.highlightPadding`.
   */
  highlightPadding?: number;
  /**
   * Configure or disable keyboard navigation.
   *
   * @example
   * keyboard: { enabled: false }                    // disable keyboard entirely
   * keyboard: { next: "ArrowRight", prev: "ArrowLeft" }
   */
  keyboard?: {
    enabled?: boolean;
    next?: string;
    prev?: string;
    close?: string;
  };
  /**
   * Wait for the browser to be idle before starting the tour. Pass `true` to
   * use a 2 s default timeout, or a number (ms) for a custom timeout.
   * Falls back to `setTimeout(0)` in environments without `requestIdleCallback`.
   */
  waitForIdle?: boolean | number;
  /**
   * Version tag for this tour. When `persist` is set and the version changes,
   * the stored completion flag is automatically invalidated — users who completed
   * an older version will see the updated tour again.
   *
   * @example
   * id: "onboarding", version: "2.0", persist: true
   */
  version?: string;
  /**
   * Resume the tour from the last step the user reached rather than from step 0.
   * Requires `id`. Progress is stored in the same storage as `persist` (defaults
   * to localStorage). Cleared automatically when the tour finishes.
   *
   * @example
   * id: "onboarding", persistProgress: true
   */
  persistProgress?: boolean;
  /**
   * URL to fetch tour steps from at runtime. The response is passed through
   * `stepsTransform` (if provided) then used as the step config.
   * Enables marketing/product to update copy without a code deploy.
   *
   * @example
   * stepsUrl: "/api/tours/onboarding",
   * stepsTransform: (data) => data.steps.map(s => ({ target: s.selector, content: s.body }))
   */
  stepsUrl?: string;
  /** Map the API response from `stepsUrl` to `TourStep[]`. Defaults to identity. */
  stepsTransform?: (data: unknown) => TourStep[];
  /**
   * Viewport width (px) below which `mobileOverrides` on each step are applied.
   * Default: 768.
   */
  breakpoint?: number;
  /**
   * Persist tour completion so it doesn't re-show on revisit.
   * - `true` → localStorage (survives page reloads)
   * - `"session"` → sessionStorage (cleared on tab close)
   *
   * Requires `id` to be set.
   *
   * @example
   * id: "onboarding-v1", persist: true
   */
  persist?: boolean | "session";
  /** Show a step counter in the popover footer. Default: true. */
  showProgress?: boolean;
  /** Animate transitions between steps. Default: true. */
  animate?: boolean;
  /** Overlay darkness, 0–1. Default: 0.75. */
  overlayOpacity?: number;
  /** Allow closing the tour by clicking the overlay or pressing Escape. Default: true. */
  allowClose?: boolean;
  /** Extra CSS class applied to the overlay. */
  overlayClass?: string;
  /** Extra CSS class applied to every popover. */
  popoverClass?: string;
  /** Label for the previous button. Default: "← Back". */
  prevBtnText?: string;
  /** Label for the next button. Default: "Next →". */
  nextBtnText?: string;
  /** Label for the done button on the last step. Default: "Done". */
  doneBtnText?: string;
  /**
   * How long (ms) to wait for a step's target element to appear in the DOM
   * after a `beforeNext` navigation. Default: 5000.
   */
  waitForTarget?: number;
  /**
   * Control how driver.js scrolls to bring highlighted elements into view.
   * - `"smooth"` (default) — animated scroll
   * - `"instant"` — immediate jump, no animation
   * - `false` — disable scrolling entirely
   */
  scrollBehavior?: "smooth" | "instant" | false;
  /**
   * Called when a recoverable error occurs (e.g. `stepsUrl` fetch failure,
   * `waitForElement` timeout, `canAdvance` throwing). Use this to surface
   * errors to your monitoring tooling.
   *
   * @example
   * onError: (err, ctx) => Sentry.captureException(err, { extra: { ctx } })
   */
  onError?: (error: Error, context: string) => void;
  /**
   * Replace driver.js's default popover with your own React component.
   * The component receives full navigation controls so you can wire up
   * Next / Back / Close however your design system requires.
   *
   * @example
   * renderPopover: ({ step, next, prev, stop, isLast }) => (
   *   <MyPopover title={step.title} onNext={next} onClose={stop}
   *              nextLabel={isLast ? "Finish" : "Next"} />
   * )
   */
  renderPopover?: FC<PopoverRenderProps>;
  /**
   * Called before `start()` does anything. Return (or resolve to) `false`
   * to abort the tour — useful for auth checks, feature-flag gates, or
   * fetching remote step config before rendering.
   *
   * @example
   * onBeforeStart: async () => {
   *   const { eligible } = await fetchOnboardingEligibility();
   *   return eligible;
   * }
   */
  onBeforeStart?: () => boolean | Promise<boolean>;
  /**
   * Log every step transition, reason, duration, and visibleWhen result
   * to the console. Invaluable for debugging complex conditional / cross-route tours.
   * Never set this in production.
   */
  debug?: boolean;
  /** Called when the tour starts. */
  onStart?: () => void;
  /** Called when every step has been completed. */
  onFinish?: () => void;
  /** Called when the tour is dismissed before finishing. */
  onSkip?: () => void;
  /** Called on each step change with the new zero-based index. */
  onStepChange?: (stepIndex: number) => void;
  /**
   * Analytics: called when a step becomes fully visible (animation done).
   * Use this to track which steps users see and when.
   *
   * @example
   * onStepEnter: (i, { step }) => analytics.track("tour_step_view", { step: i, title: step.title })
   */
  onStepEnter?: (stepIndex: number, meta: { enteredAt: number; step: TourStep }) => void;
  /**
   * Analytics: called when the user leaves a step for any reason.
   * `duration` is how long (ms) the user spent on the step.
   * `reason` is one of `'next' | 'prev' | 'skip' | 'close'`.
   *
   * @example
   * onStepExit: (i, { duration, reason }) => analytics.track("tour_step_exit", { step: i, duration, reason })
   */
  onStepExit?: (stepIndex: number, meta: { duration: number; reason: StepExitReason; step: TourStep }) => void;
}

/** How the user left a step — used in `onStepExit`. */
export type StepExitReason = "next" | "prev" | "skip" | "close";

/** Props passed to the `renderPopover` render function. */
export interface PopoverRenderProps {
  /** The current step's config. */
  step: TourStep;
  /** Zero-based index of the current step within visible steps. */
  stepIndex: number;
  /** Total number of visible steps. */
  totalSteps: number;
  /** Advance to the next step. */
  next: () => void;
  /** Go back to the previous step. */
  prev: () => void;
  /** Close / stop the tour. */
  stop: () => void;
  /** True when this is the first step. */
  isFirst: boolean;
  /** True when this is the last step. */
  isLast: boolean;
}

/** Return value of `useTour`. */
export interface TourControls {
  /** Start the tour, optionally from a specific step index. */
  start: (stepIndex?: number) => void;
  /** Stop / destroy the active tour. */
  stop: () => void;
  /** Restart the tour from step 0 without triggering onSkip or onFinish. */
  restart: () => void;
  /** Advance to the next step. */
  next: () => void;
  /** Go back to the previous step. */
  prev: () => void;
  /** Jump to any step by index. */
  moveTo: (stepIndex: number) => void;
  /** True while the tour is running. */
  isActive: boolean;
  /** Zero-based index of the currently highlighted step, within visible steps only. */
  currentStep: number;
  /** Total number of visible steps (after visibleWhen filtering). */
  totalSteps: number;
}

export interface TourContextValue {
  /** Id of the currently running tour, or null. */
  activeTourId: string | null;
  setActiveTourId: (id: string | null) => void;
  /** Registry for named tours — populated by useRegisterTour. */
  registry: Map<string, TourControls>;
  /** Register a named tour — triggers re-renders of useTourControls consumers. */
  registerTour: (id: string, controls: TourControls) => void;
  /** Unregister a named tour. */
  unregisterTour: (id: string) => void;
}
