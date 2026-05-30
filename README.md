# @oqlet/react-driver

Schema-driven, plug-and-play guided tours for React — built on [driver.js](https://driverjs.com).

Define your tour as data. One hook, zero boilerplate.

```tsx
const { start } = useTour({
  steps: [
    { target: "#save-btn",  title: "Save your work",  content: "Click here to save at any time." },
    { target: "#share-btn", title: "Share with team", content: "Invite collaborators in one click." },
  ],
  onFinish: () => markOnboardingDone(),
});

return <button onClick={() => start()}>Take the tour</button>;
```

---

## Installation

```bash
npm install @oqlet/react-driver driver.js
```

> `driver.js` is a peer dependency — install it alongside the library.
> Also import driver.js's CSS once in your app entry:
> ```ts
> import "driver.js/dist/driver.css";
> ```

---

## Quick start

### Single tour (no provider needed)

```tsx
import { useTour } from "@oqlet/react-driver";

function App() {
  const { start } = useTour({
    steps: [
      { target: "#step-1", title: "Welcome", content: "Let's get you started." },
      { target: "#step-2", title: "Settings", content: "Customise your experience here." },
    ],
  });

  return <button onClick={() => start()}>Start tour</button>;
}
```

### Multiple tours (with provider)

Wrap your app root with `<TourProvider>` to coordinate multiple tours and ensure only one runs at a time.

```tsx
import { TourProvider, useTour } from "@oqlet/react-driver";

function Root() {
  return (
    <TourProvider>
      <App />
    </TourProvider>
  );
}

function Onboarding() {
  const { start } = useTour({ steps: [ /* ... */ ] });
  return <button onClick={() => start()}>Onboarding tour</button>;
}

function FeatureTour() {
  const { start } = useTour({ steps: [ /* ... */ ] });
  return <button onClick={() => start()}>New feature walkthrough</button>;
}
```

---

## API

### `useTour(config)`

```ts
const { start, stop, next, prev, moveTo, isActive, currentStep } = useTour(config);
```

#### `TourConfig`

| Prop | Type | Default | Description |
|---|---|---|---|
| `steps` | `TourStep[]` | — | **Required.** Array of tour steps. |
| `showProgress` | `boolean` | `true` | Show step counter in the popover footer. |
| `animate` | `boolean` | `true` | Animate transitions between steps. |
| `overlayOpacity` | `number` | `0.75` | Overlay darkness (0–1). |
| `allowClose` | `boolean` | `true` | Allow closing via Escape or overlay click. |
| `overlayClass` | `string` | — | Extra CSS class on the overlay. |
| `popoverClass` | `string` | — | Extra CSS class on every popover. |
| `prevBtnText` | `string` | `"← Back"` | Previous button label. |
| `nextBtnText` | `string` | `"Next →"` | Next button label. |
| `doneBtnText` | `string` | `"Done"` | Done button label on the last step. |
| `onStart` | `() => void` | — | Called when the tour starts. |
| `onFinish` | `() => void` | — | Called when all steps are completed. |
| `onSkip` | `() => void` | — | Called when the tour is dismissed early. |
| `onStepChange` | `(index: number) => void` | — | Called on each step change. |

#### `TourStep`

| Prop | Type | Description |
|---|---|---|
| `target` | `string \| RefObject<Element>` | CSS selector or React ref of the element to highlight. Omit for a centred popover with no highlight. |
| `title` | `string` | Popover heading. |
| `content` | `string` | **Required.** Popover body text. |
| `side` | `"top" \| "bottom" \| "left" \| "right"` | Which side of the element the popover appears on. |
| `align` | `"start" \| "center" \| "end"` | Popover alignment relative to the element. |
| `popoverClass` | `string` | Extra CSS class for this step's popover. |
| `onBeforeHighlight` | `() => void` | Called just before this step highlights. |
| `onAfterHighlight` | `() => void` | Called after this step is fully visible. |
| `onDeselected` | `() => void` | Called when leaving this step. |

#### `TourControls`

| Member | Type | Description |
|---|---|---|
| `start` | `(stepIndex?: number) => void` | Start the tour, optionally from a specific step. |
| `stop` | `() => void` | Immediately destroy the active tour. |
| `next` | `() => void` | Advance to the next step. |
| `prev` | `() => void` | Go back to the previous step. |
| `moveTo` | `(index: number) => void` | Jump to any step by index. |
| `isActive` | `boolean` | `true` while the tour is running. |
| `currentStep` | `number` | Zero-based index of the highlighted step. |

---

### `<TourProvider>`

Optional context provider. Needed only when running multiple tours in the same app — it ensures only one is active at a time and exposes `activeTourId` to any component via `useTourContext()`.

```tsx
<TourProvider>
  <App />
</TourProvider>
```

### `useTourContext()`

Read the active tour state from anywhere inside `<TourProvider>`.

```tsx
const { activeTourId } = useTourContext() ?? {};
```

---

## Recipes

### Start from a specific step

```tsx
const { start } = useTour({ steps });
<button onClick={() => start(2)}>Skip to step 3</button>
```

### Use a React ref as a target

```tsx
const ref = useRef<HTMLDivElement>(null);
const { start } = useTour({
  steps: [{ target: ref, title: "Here", content: "This element." }],
});
```

### Programmatic navigation

```tsx
const { start, next, prev, moveTo } = useTour({ steps });
```

### Floating popover (no highlight)

Omit `target` to show a centred popover without highlighting any element:

```tsx
{ title: "Welcome!", content: "This is a floating intro." }
```

### Custom styling

Pass a `popoverClass` to theme individual steps or the whole tour:

```tsx
useTour({
  popoverClass: "my-tour-theme",
  steps: [
    { target: "#a", content: "Step A.", popoverClass: "step-a-override" },
  ],
});
```

---

## Contributing

Issues and pull requests are welcome. Please open an issue first for significant changes.

```bash
git clone https://github.com/goutham-05/react-driver
cd react-driver
npm install
npm test        # vitest — 19 tests
npm run build   # tsup — ESM + CJS + .d.ts + .d.cts
```

---

## License

MIT
