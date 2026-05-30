import type { RefObject } from "react";

/** A single step in a guided tour. */
export interface TourStep {
  /** CSS selector or a React ref pointing to the element to highlight. */
  target?: string | RefObject<Element | null>;
  /** Popover title. */
  title?: string;
  /** Popover body text. */
  content: string;
  /** Which side of the element the popover appears on. */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment of the popover relative to the element. */
  align?: "start" | "center" | "end";
  /** Extra CSS class added to this step's popover. */
  popoverClass?: string;
  /** Called just before this step is highlighted. */
  onBeforeHighlight?: () => void;
  /** Called after this step is fully highlighted. */
  onAfterHighlight?: () => void;
  /** Called when leaving this step. */
  onDeselected?: () => void;
}

/** Configuration passed to `useTour`. */
export interface TourConfig {
  steps: TourStep[];
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
  /** Called when the tour starts. */
  onStart?: () => void;
  /** Called when every step has been completed. */
  onFinish?: () => void;
  /** Called when the tour is dismissed before finishing. */
  onSkip?: () => void;
  /** Called on each step change with the new zero-based index. */
  onStepChange?: (stepIndex: number) => void;
}

/** Return value of `useTour`. */
export interface TourControls {
  /** Start the tour, optionally from a specific step index. */
  start: (stepIndex?: number) => void;
  /** Stop / destroy the active tour. */
  stop: () => void;
  /** Advance to the next step. */
  next: () => void;
  /** Go back to the previous step. */
  prev: () => void;
  /** Jump to any step by index. */
  moveTo: (stepIndex: number) => void;
  /** True while the tour is running. */
  isActive: boolean;
  /** Zero-based index of the currently highlighted step. */
  currentStep: number;
}

export interface TourContextValue {
  /** Id of the currently running tour, or null. */
  activeTourId: string | null;
  setActiveTourId: (id: string | null) => void;
}
