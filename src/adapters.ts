import type { TourConfig } from "./types";

type AdapterConfig = Pick<TourConfig,
  "onStart" | "onFinish" | "onSkip" | "onStepEnter" | "onStepExit"
>;

// ── PostHog ───────────────────────────────────────────────────────────────────

interface PostHogLike {
  capture: (event: string, properties?: Record<string, unknown>) => void;
}

/**
 * Pre-wired PostHog analytics adapter.
 * Spread into `useTour` to automatically track tour events.
 *
 * @example
 * import posthog from "posthog-js";
 * import { adapters } from "@oqlet/react-driver";
 *
 * useTour({ ...adapters.posthog(posthog, { tourId: "onboarding" }), steps: [...] });
 */
export function posthog(
  client: PostHogLike,
  meta?: { tourId?: string }
): AdapterConfig {
  const t = meta?.tourId ?? "unknown";
  return {
    onStart:     ()              => client.capture("tour_started",      { tour: t }),
    onFinish:    ()              => client.capture("tour_completed",    { tour: t }),
    onSkip:      ()              => client.capture("tour_skipped",      { tour: t }),
    onStepEnter: (i, { step })   => client.capture("tour_step_view",    { tour: t, step: i, title: String(step.title ?? "") }),
    onStepExit:  (i, { duration, reason }) =>
      client.capture("tour_step_exit", { tour: t, step: i, duration, reason }),
  };
}

// ── Segment ───────────────────────────────────────────────────────────────────

interface SegmentLike {
  track: (event: string, properties?: Record<string, unknown>) => void;
}

/**
 * Pre-wired Segment analytics adapter.
 *
 * @example
 * import { adapters } from "@oqlet/react-driver";
 * useTour({ ...adapters.segment(window.analytics, { tourId: "onboarding" }), steps: [...] });
 */
export function segment(
  client: SegmentLike,
  meta?: { tourId?: string }
): AdapterConfig {
  const t = meta?.tourId ?? "unknown";
  return {
    onStart:    ()             => client.track("Tour Started",    { tour: t }),
    onFinish:   ()             => client.track("Tour Completed",  { tour: t }),
    onSkip:     ()             => client.track("Tour Skipped",    { tour: t }),
    onStepEnter:(i, { step })  => client.track("Tour Step Viewed",{ tour: t, step: i, title: String(step.title ?? "") }),
    onStepExit: (i, m)         => client.track("Tour Step Exited",{ tour: t, step: i, duration: m.duration, reason: m.reason }),
  };
}

// ── Mixpanel ──────────────────────────────────────────────────────────────────

interface MixpanelLike {
  track: (event: string, properties?: Record<string, unknown>) => void;
}

/**
 * Pre-wired Mixpanel analytics adapter.
 *
 * @example
 * import mixpanel from "mixpanel-browser";
 * import { adapters } from "@oqlet/react-driver";
 * useTour({ ...adapters.mixpanel(mixpanel, { tourId: "onboarding" }), steps: [...] });
 */
export function mixpanel(
  client: MixpanelLike,
  meta?: { tourId?: string }
): AdapterConfig {
  const t = meta?.tourId ?? "unknown";
  return {
    onStart:    ()            => client.track("Tour Started",    { tour: t }),
    onFinish:   ()            => client.track("Tour Completed",  { tour: t }),
    onSkip:     ()            => client.track("Tour Skipped",    { tour: t }),
    onStepEnter:(i, { step }) => client.track("Tour Step Viewed",{ tour: t, step: i, title: String(step.title ?? "") }),
    onStepExit: (i, m)        => client.track("Tour Step Exited",{ tour: t, step: i, duration: m.duration, reason: m.reason }),
  };
}

// ── Amplitude ─────────────────────────────────────────────────────────────────

interface AmplitudeLike {
  track: (event: string, properties?: Record<string, unknown>) => void;
}

/**
 * Pre-wired Amplitude analytics adapter.
 *
 * @example
 * import * as amplitude from "@amplitude/analytics-browser";
 * import { adapters } from "@oqlet/react-driver";
 * useTour({ ...adapters.amplitude(amplitude, { tourId: "onboarding" }), steps: [...] });
 */
export function amplitude(
  client: AmplitudeLike,
  meta?: { tourId?: string }
): AdapterConfig {
  const t = meta?.tourId ?? "unknown";
  return {
    onStart:    ()            => client.track("tour_started",   { tour: t }),
    onFinish:   ()            => client.track("tour_completed", { tour: t }),
    onSkip:     ()            => client.track("tour_skipped",   { tour: t }),
    onStepEnter:(i, { step }) => client.track("tour_step_view", { tour: t, step: i, title: String(step.title ?? "") }),
    onStepExit: (i, m)        => client.track("tour_step_exit", { tour: t, step: i, duration: m.duration, reason: m.reason }),
  };
}

/** All built-in analytics adapters. */
export const adapters = { posthog, segment, mixpanel, amplitude };
