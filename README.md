# ReactDriver

[Website](https://www.react-driver.com/) | [GitHub](https://github.com/goutham-05/react-driver) | [npm](https://www.npmjs.com/package/@oqlet/react-driver)

A schema-driven guided tour library for React. Define product onboarding, feature walkthroughs, cross-page tours, beacons, tooltips, and analytics as typed configuration instead of wiring tour state by hand.

Built on [driver.js](https://driverjs.com/) for the spotlight, overlay, and popover engine. ReactDriver adds React hooks, JSX content, route-aware step lifecycle hooks, persistence, analytics adapters, tour registration, and testing utilities.

---

## Features

- **Schema-driven tours** - define every step as a plain `TourStep[]`
- **React-first API** - `useTour`, `TourProvider`, named tour controls, and composable hooks
- **JSX content** - render strings, rich React nodes, custom popovers, images, buttons, or design-system components
- **Cross-route navigation** - `beforeNext`, `beforePrev`, `afterNext`, `afterPrev`, and `waitForTarget` support page transitions
- **Action-driven steps** - advance from clicks with `advanceOn`, validation with `canAdvance`, timers with `autoAdvanceAfter`
- **Persistence** - remember completed tours, resume progress, cap show count, or re-show when `version` changes
- **Scheduling** - delay tours by time, page visits, release date, or idle time
- **Responsive steps** - override copy, placement, and behavior on mobile with `mobileOverrides`
- **Conditional visibility** - skip steps at runtime with `visibleWhen`
- **Tour registry** - register tours globally and start them from any component without prop drilling
- **Sequences** - play multiple named tours back-to-back with `useTourSequence`
- **Beacons and tooltips** - ship non-blocking feature discovery alongside full tours
- **Analytics** - lifecycle hooks plus PostHog, Segment, Mixpanel, and Amplitude adapters
- **Testing utilities** - mock `TourControls` cleanly in Vitest/Jest
- **TypeScript-first** - typed config, controls, render props, analytics metadata, and utility exports

---

## Installation

```bash
npm install @oqlet/react-driver
# peer dependencies, if not already installed
npm install react react-dom
```

`driver.js` is installed as a package dependency. Import the CSS once in your app entry:

```ts
import "@oqlet/react-driver/driver.css";
```

> **Compatibility** - peer dependencies support React 17+. The library is tested in this repo with React 19.
>
> **Bundling** - the package ships ESM, CJS, UMD, CSS, and TypeScript declarations.

---

## Quick Start

```tsx
import { useTour, type TourStep } from "@oqlet/react-driver";
import "@oqlet/react-driver/driver.css";

const steps: TourStep[] = [
  {
    target: "#workspace-switcher",
    title: "Switch workspaces",
    content: "Jump between teams, clients, or environments from here.",
    side: "bottom",
  },
  {
    target: "#create-project",
    title: "Create a project",
    content: "Start a new project with the defaults your team already uses.",
  },
  {
    target: "#invite-team",
    title: "Invite your team",
    content: "Bring collaborators in when the setup is ready.",
  },
];

export default function Dashboard() {
  const tour = useTour({
    id: "dashboard-onboarding",
    steps,
    persist: true,
    showProgress: true,
    onFinish: () => console.log("Tour completed"),
  });

  return (
    <button onClick={() => tour.start()}>
      Take the tour
    </button>
  );
}
```

---

## TourStep Props

| Prop | Type | Description |
|------|------|-------------|
| `target` | `string \| RefObject<Element \| null>` | Element to highlight. Omit for a centered popover. |
| `title` | `ReactNode` | Popover heading. |
| `content` | `ReactNode` | Required popover body. Strings and JSX are both supported. |
| `side` | `"top" \| "bottom" \| "left" \| "right"` | Popover side. |
| `align` | `"start" \| "center" \| "end"` | Popover alignment. |
| `popoverClass` | `string` | Extra class for this step's popover. |
| `popoverless` | `boolean` | Highlight the target without rendering a popover. |
| `section` | `string` | Group label used by `TourChecklist`. |
| `mobileOverrides` | `Partial<TourStep>` | Step overrides below the configured breakpoint. |
| `visibleWhen` | `() => boolean` | Skip this step when it returns `false`. |
| `delayBefore` | `number` | Wait before showing the popover after highlight. |
| `delayAfter` | `number` | Wait before moving to the next/previous step. |
| `highlightPadding` | `number` | Per-step overlay cutout padding. |
| `canAdvance` | `() => boolean \| Promise<boolean>` | Block Next until the guard passes. |
| `autoAdvanceAfter` | `number` | Automatically continue after N milliseconds. |
| `advanceOn` | `string` | Click selector that advances the current step. |
| `beforeNext` / `beforePrev` | `() => void \| Promise<void>` | Run before navigation. Good for route changes. |
| `afterNext` / `afterPrev` | `() => void` | Run after the next/previous step has settled. |
| `onBeforeHighlight` | `() => void` | Called before the step is highlighted. |
| `onAfterHighlight` | `() => void` | Called after the step is highlighted. |
| `onDeselected` | `() => void` | Called when leaving the step. |

---

## useTour Config

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `steps` | `TourStep[]` | required | Step definitions. |
| `id` | `string` | - | Required for persistence, registry, and history helpers. |
| `persist` | `boolean \| "session"` | `false` | Store completion in localStorage or sessionStorage. |
| `persistProgress` | `boolean` | `false` | Resume from the last reached step. |
| `version` | `string` | - | Re-show a persisted tour when the version changes. |
| `showCount` | `number` | - | Show at most N times. |
| `showAfter` | `{ delay?: number; visits?: number; date?: string \| Date }` | - | Schedule automatic start. |
| `stepsUrl` | `string` | - | Fetch steps at runtime. |
| `stepsTransform` | `(data: unknown) => TourStep[]` | identity | Map remote data into steps. |
| `breakpoint` | `number` | `768` | Width below which `mobileOverrides` apply. |
| `highlightPadding` | `number` | driver.js default | Extra overlay cutout padding. |
| `keyboard` | `{ enabled?: boolean; next?: string; prev?: string; close?: string }` | enabled | Configure keyboard navigation. |
| `waitForIdle` | `boolean \| number` | `false` | Start after browser idle time. |
| `waitForTarget` | `number` | `5000` | Time to wait for route-created targets. |
| `scrollBehavior` | `"smooth" \| "instant" \| false` | `"smooth"` | Target scrolling behavior. |
| `showProgress` | `boolean` | `true` | Show step count in the popover. |
| `animate` | `boolean` | `true` | Animate step transitions. |
| `overlayOpacity` | `number` | `0.75` | Overlay darkness from 0 to 1. |
| `allowClose` | `boolean` | `true` | Allow Escape/overlay close. |
| `overlayClass` | `string` | - | Extra overlay class. |
| `popoverClass` | `string` | - | Extra class for all popovers. |
| `prevBtnText` / `nextBtnText` / `doneBtnText` | `string` | built-in labels | Button labels. |
| `renderPopover` | `FC<PopoverRenderProps>` | - | Replace the default popover. |
| `onBeforeStart` | `() => boolean \| Promise<boolean>` | - | Abort start by returning `false`. |
| `onError` | `(error: Error, context: string) => void` | - | Capture recoverable errors. |
| `debug` | `boolean` | `false` | Log step transitions and visibility decisions. |
| `onStart` / `onFinish` / `onSkip` | `() => void` | - | Tour lifecycle callbacks. |
| `onStepChange` | `(stepIndex: number) => void` | - | Called on current step change. |
| `onStepEnter` | `(index, meta) => void` | - | Analytics hook when a step becomes visible. |
| `onStepExit` | `(index, meta) => void` | - | Analytics hook when leaving a step. |

---

## Tour Controls

`useTour` and `useRegisterTour` return a `TourControls` object:

| Control | Type | Description |
|---------|------|-------------|
| `start` | `(stepIndex?: number) => void` | Start the tour, optionally from a specific step. |
| `stop` | `() => void` | Stop and destroy the active tour. |
| `restart` | `() => void` | Restart from step 0 without firing finish/skip. |
| `next` | `() => void` | Advance one step. |
| `prev` | `() => void` | Move back one step. |
| `moveTo` | `(stepIndex: number) => void` | Jump to a step by index. |
| `onComplete` | `(cb) => () => void` | Subscribe to finish/skip from outside the config. |
| `isActive` | `boolean` | True while the tour is running. |
| `currentStep` | `number` | Current visible step index. |
| `totalSteps` | `number` | Number of visible steps. |

---

## Cross-Route Tours

Use `beforeNext` or `beforePrev` to navigate, then let ReactDriver wait for the next target.

```tsx
import { useNavigate } from "react-router-dom";
import { useTour } from "@oqlet/react-driver";

function ProductTour() {
  const navigate = useNavigate();

  const tour = useTour({
    id: "checkout",
    waitForTarget: 7000,
    steps: [
      {
        target: "#product-card",
        title: "Choose a product",
        content: "Start from any product card in the catalog.",
      },
      {
        target: "#cart-summary",
        title: "Review your cart",
        content: "The tour waits until the cart route has rendered.",
        beforeNext: async () => navigate("/cart"),
      },
      {
        target: "#checkout-button",
        title: "Checkout",
        content: "Finish the purchase flow here.",
      },
    ],
  });

  return <button onClick={() => tour.start()}>Start checkout tour</button>;
}
```

---

## Action-Driven Steps

Move the tour forward only after the user performs the right action.

```tsx
const tour = useTour({
  id: "profile-setup",
  steps: [
    {
      target: "#profile-menu",
      title: "Open profile settings",
      content: "Click this menu item to continue.",
      advanceOn: "#profile-menu",
      beforeNext: () => setProfilePanelOpen(true),
      afterNext: () => setMenuOpen(false),
    },
    {
      target: "#display-name",
      title: "Add your display name",
      content: "Enter at least 3 characters before continuing.",
      canAdvance: () => displayName.trim().length >= 3,
    },
  ],
});
```

---

## Persistence and Scheduling

```tsx
useTour({
  id: "new-dashboard",
  version: "2.0",
  persist: true,
  persistProgress: true,
  showCount: 3,
  showAfter: {
    visits: 2,
    delay: 3000,
  },
  steps,
});
```

| Option | What it does |
|--------|--------------|
| `persist: true` | Do not show again after completion. |
| `persist: "session"` | Remember completion only for the current tab session. |
| `persistProgress: true` | Resume from the last reached step. |
| `version` | Invalidate old completion state when the tour changes. |
| `showCount` | Stop auto-showing after N starts. |
| `showAfter.delay` | Auto-start after N milliseconds. |
| `showAfter.visits` | Auto-start from the Nth visit onward. |
| `showAfter.date` | Auto-start only after a date. |

---

## Global Tours

Wrap your app with `TourProvider`, register tours near the UI they describe, and start them from anywhere.

```tsx
import {
  TourProvider,
  useRegisterTour,
  useTourControls,
} from "@oqlet/react-driver";

function App() {
  return (
    <TourProvider>
      <Dashboard />
      <HelpMenu />
    </TourProvider>
  );
}

function Dashboard() {
  useRegisterTour("dashboard", {
    persist: true,
    steps: [
      { target: "#stats", title: "Stats", content: "Your key metrics live here." },
      { target: "#filters", title: "Filters", content: "Narrow down the view." },
    ],
  });

  return <main>...</main>;
}

function HelpMenu() {
  const dashboardTour = useTourControls("dashboard");
  return <button onClick={() => dashboardTour?.start()}>Replay dashboard tour</button>;
}
```

---

## Tour Sequences

Chain registered tours into a single onboarding flow.

```tsx
function OnboardingButton() {
  const sequence = useTourSequence(["setup", "dashboard", "billing"]);

  return (
    <button onClick={sequence.startSequence}>
      Start onboarding
    </button>
  );
}
```

---

## Beacons, Checklists, and Tooltips

```tsx
import {
  TourBeacon,
  TourChecklist,
  TourTooltip,
  useRegisterTour,
} from "@oqlet/react-driver";

const controls = useRegisterTour("reports", {
  steps: [
    { section: "Reports", target: "#report-type", title: "Report type", content: "Choose the format." },
    { section: "Reports", target: "#date-range", title: "Date range", content: "Pick the reporting period." },
  ],
});

<TourBeacon target="#reports-nav" tourId="reports" position="bottom-right" />;

<TourChecklist
  steps={steps}
  currentStep={controls.currentStep}
  isActive={controls.isActive}
  onJumpTo={controls.moveTo}
/>;

<TourTooltip
  target="#export-button"
  title="Export"
  content="Download this report as CSV."
  trigger="hover"
/>;
```

---

## Custom Popovers

Use `renderPopover` when your app needs a fully custom design-system surface.

```tsx
useTour({
  steps,
  renderPopover: ({ step, stepIndex, totalSteps, next, prev, stop, isFirst, isLast }) => (
    <section className="rounded-lg border bg-white p-4 shadow-xl">
      <h2>{step.title}</h2>
      <div>{step.content}</div>

      <footer>
        <span>{stepIndex + 1} / {totalSteps}</span>
        <button onClick={stop}>Close</button>
        <button onClick={prev} disabled={isFirst}>Back</button>
        <button onClick={next}>{isLast ? "Done" : "Next"}</button>
      </footer>
    </section>
  ),
});
```

---

## Remote Steps

Load copy and selectors from an endpoint when product or growth teams need to update tours without redeploying the app.

```tsx
useTour({
  id: "release-tour",
  steps: [],
  stepsUrl: "/api/tours/release-tour",
  stepsTransform: (data) => {
    const payload = data as {
      steps: Array<{ selector: string; heading: string; body: string }>;
    };

    return payload.steps.map((step) => ({
      target: step.selector,
      title: step.heading,
      content: step.body,
    }));
  },
});
```

---

## Analytics

Use lifecycle callbacks directly or spread in a prebuilt adapter.

```tsx
import posthog from "posthog-js";
import { adapters, useTour } from "@oqlet/react-driver";

useTour({
  ...adapters.posthog(posthog, { tourId: "activation" }),
  steps,
});
```

Custom analytics:

```tsx
useTour({
  steps,
  onStart: () => analytics.track("Tour Started"),
  onFinish: () => analytics.track("Tour Completed"),
  onSkip: () => analytics.track("Tour Skipped"),
  onStepEnter: (index, { step }) => {
    analytics.track("Tour Step Viewed", {
      index,
      title: typeof step.title === "string" ? step.title : undefined,
    });
  },
  onStepExit: (index, { duration, reason }) => {
    analytics.track("Tour Step Exited", { index, duration, reason });
  },
});
```

Built-in adapters:

| Adapter | Import |
|---------|--------|
| PostHog | `adapters.posthog(posthog, { tourId })` |
| Segment | `adapters.segment(window.analytics, { tourId })` |
| Mixpanel | `adapters.mixpanel(mixpanel, { tourId })` |
| Amplitude | `adapters.amplitude(amplitude, { tourId })` |

---

## Localization

`locales` contains button-label presets for `en`, `fr`, `es`, `de`, `pt`, `it`, `nl`, `ja`, `zh`, `ko`, `ar`, `ru`, and `hi`.

```tsx
import { locales, useTour } from "@oqlet/react-driver";

useTour({
  ...locales.fr,
  steps,
});
```

You can also pass labels directly:

```tsx
useTour({
  prevBtnText: "Previous",
  nextBtnText: "Continue",
  doneBtnText: "Finish",
  steps,
});
```

---

## Testing

Mock tour controls without rendering driver.js in unit tests.

```ts
import { createMockTour } from "@oqlet/react-driver/testing";
import { vi, expect } from "vitest";

const mockTour = createMockTour({
  isActive: true,
  currentStep: 1,
});

vi.mock("@oqlet/react-driver", () => ({
  useTour: () => mockTour,
}));

expect(mockTour.start).toHaveBeenCalledWith(0);
```

---

## CDN / UMD

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@oqlet/react-driver/dist/driver.css"
/>
<script src="https://unpkg.com/react/umd/react.production.min.js"></script>
<script src="https://unpkg.com/react-dom/umd/react-dom.production.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oqlet/react-driver/dist/react-driver.umd.js"></script>
<script>
  const { useTour } = ReactDriver;
</script>
```

---

## API Exports

```ts
import {
  TourProvider,
  TourBeacon,
  TourChecklist,
  TourTooltip,
  useTour,
  useRegisterTour,
  useTourControls,
  useIsTourActive,
  useTourStep,
  useTourSequence,
  useStepRef,
  useTourHistory,
  useTourAnalytics,
  waitForElement,
  hasSeenTour,
  skipTour,
  clearTourHistory,
  locales,
  adapters,
} from "@oqlet/react-driver";

import type {
  TourStep,
  TourConfig,
  TourControls,
  PopoverRenderProps,
  StepExitReason,
} from "@oqlet/react-driver";
```

Testing export:

```ts
import { createMockTour } from "@oqlet/react-driver/testing";
```

CSS export:

```ts
import "@oqlet/react-driver/driver.css";
```

---

## Contributing

```bash
git clone https://github.com/goutham-05/react-driver
cd react-driver
npm install
npm test        # vitest - 128 tests
npm run build   # tsup - ESM + CJS + .d.cts + CSS + UMD

cd website
npm install
npm run build   # Vite website
```

---

## License

MIT
