# @oqlet/react-driver

Schema-driven, plug-and-play guided tours for React — built on [driver.js](https://driverjs.com).

Define your tour as data. One hook, zero boilerplate.

```tsx
import { useTour } from "@oqlet/react-driver";
import "@oqlet/react-driver/driver.css";

function App() {
  const { start } = useTour({
    steps: [
      { target: "#save-btn",  title: "Save your work",  content: "Click here to save." },
      { target: "#share-btn", title: "Share with team", content: "Invite collaborators." },
    ],
    onFinish: () => markOnboardingDone(),
  });

  return <button onClick={() => start()}>Take the tour</button>;
}
```

---

## Installation

```bash
npm install @oqlet/react-driver
```

`driver.js` is a bundled dependency — no separate install. Import the CSS once in your app entry:

```ts
import "@oqlet/react-driver/driver.css";
```

---

## Features at a glance

| Category | What's included |
| --- | --- |
| **Core** | `useTour`, `restart()`, `totalSteps`, `beforeNext/Prev`, `afterNext/Prev` |
| **Interaction** | `advanceOn`, `canAdvance`, `autoAdvanceAfter`, `delayBefore`, `delayAfter` |
| **Visibility** | `visibleWhen`, `popoverless`, `section`, `mobileOverrides` |
| **Persistence** | `persist`, `version`, `persistProgress`, `showCount`, `showAfter` |
| **Content** | JSX `title`/`content`, `renderPopover`, `stepsUrl` |
| **Analytics** | `onStepEnter`, `onStepExit`, `useTourAnalytics`, `useTourHistory`, `adapters.*` |
| **Registry** | `useRegisterTour`, `useTourControls`, `useTourSequence`, `useIsTourActive`, `useTourStep` |
| **Components** | `TourBeacon`, `TourChecklist`, `TourTooltip` |
| **Utilities** | `locales` (13 languages), `useStepRef`, `skipTour`, `hasSeenTour`, `createMockTour` |
| **Config** | `keyboard`, `scrollBehavior`, `highlightPadding`, `waitForIdle`, `debug`, `onError` |

---

## Core usage

```tsx
const { start, stop, restart, next, prev, moveTo, isActive, currentStep, totalSteps } = useTour({
  steps: [
    { target: "#element", title: "Title", content: "Description." },
  ],
});
```

## Cross-route navigation

```tsx
const { start } = useTour({
  steps: [
    { target: "#product",     content: "Browse products." },
    { target: "#add-to-cart", content: "Add it to your cart.",
      beforeNext: () => navigate("/cart"),       // navigate on Next
      afterNext:  () => setCartOpen(false) },    // cleanup after animation
    { target: "#cart-item",   content: "Your item is here." },
  ],
  waitForTarget: 5000,
});
```

## Action-driven tours

```tsx
const { start } = useTour({
  steps: [
    { target: "#menu-item",
      content: "Click it or press Next to continue.",
      advanceOn: "#menu-item",                   // element click = Next
      beforeNext: () => setPanel("profile"),     // owns state change
      afterNext:  () => setMenuOpen(false) },    // cleanup after animation
    { target: "#panel-profile",
      content: "Your profile settings." },
  ],
});
```

## Persistence & scheduling

```tsx
useTour({
  id:              "onboarding",
  version:         "2.0",           // re-show when version changes
  persist:         true,            // don't show again after completion
  persistProgress: true,            // resume from last step on revisit
  showCount:       3,               // show at most 3 times
  showAfter:       { visits: 2, delay: 5000 },  // 5s after the 2nd visit
  steps: [...],
});
```

## Analytics

```tsx
import { adapters } from "@oqlet/react-driver";
import posthog from "posthog-js";

// Pre-wired PostHog / Segment / Mixpanel / Amplitude adapters
useTour({ ...adapters.posthog(posthog, { tourId: "onboarding" }), steps: [...] });

// Or custom analytics via hooks
useTour({
  onStepEnter: (i, { step }) => analytics.track("step_view", { step: i }),
  onStepExit:  (i, { duration, reason }) => analytics.track("step_exit", { duration, reason }),
  steps: [...],
});
```

## TourBeacon & TourTooltip

```tsx
import { TourBeacon, TourTooltip } from "@oqlet/react-driver";

// Pulsing dot — click to start a named tour
useRegisterTour("feature-x", featureXConfig);
<TourBeacon target="#new-feature" tourId="feature-x" />

// Non-intrusive tooltip — no overlay, no darkening
<TourTooltip target="#help-icon" content="Click for a guided tour." trigger="hover" />
```

## Locales

```tsx
import { locales } from "@oqlet/react-driver";

// 13 built-in languages: en fr es de pt it nl ja zh ko ar ru hi
useTour({ ...locales.fr, steps: [...] });
```

## Testing utilities

```ts
import { createMockTour } from "@oqlet/react-driver/testing";

const mock = createMockTour({ isActive: true });
vi.mock("@oqlet/react-driver", () => ({ useTour: () => mock }));
expect(mock.start).toHaveBeenCalledWith(0);
```

## CDN / UMD

```html
<script src="https://cdn.jsdelivr.net/npm/@oqlet/react-driver/dist/react-driver.umd.js"></script>
<script>
  const { useTour } = ReactDriver;
</script>
```

---

## Contributing

```bash
git clone https://github.com/goutham-05/react-driver
cd react-driver
npm install
npm test        # vitest — 128 tests
npm run build   # tsup — ESM + CJS + UMD + .d.ts + .d.cts
```

---

## License

MIT
