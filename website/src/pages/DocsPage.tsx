import React, { useState, useEffect } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="rounded px-2 py-1 text-[11px] font-semibold text-zinc-400 transition-all hover:text-white">
      {copied ? "✓" : "Copy"}
    </button>
  );
}

function Code({ code, lang = "tsx" }: { code: string; lang?: string }) {
  return (
    <div className="my-5 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-xs text-zinc-500">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-zinc-300"><code>{code}</code></pre>
    </div>
  );
}

function PropTable({ rows }: { rows: { prop: string; type: string; default?: string; desc: string }[] }) {
  return (
    <div className="my-5 overflow-hidden rounded-xl border border-gray-200 dark:border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900/50">
            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">Prop</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">Type</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">Default</th>
            <th className="px-4 py-3 text-left font-semibold text-gray-700 dark:text-zinc-300">Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r.prop} className={i % 2 === 0 ? "bg-white dark:bg-zinc-950" : "bg-gray-50/50 dark:bg-zinc-900/30"}>
              <td className="px-4 py-3 font-mono text-blue-700 dark:text-blue-400">{r.prop}</td>
              <td className="px-4 py-3 font-mono text-xs text-purple-700 dark:text-purple-400">{r.type}</td>
              <td className="px-4 py-3 text-gray-500 dark:text-zinc-500">{r.default ?? "—"}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-zinc-400">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 id={id} className="mb-3 mt-12 scroll-mt-20 text-2xl font-bold">{children}</h2>;
}
function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return <h3 id={id} className="mb-2 mt-8 scroll-mt-20 text-lg font-bold">{children}</h3>;
}

const sections = [
  { id: "installation",      label: "Installation"          },
  { id: "quick-start",       label: "Quick start"           },
  { id: "use-tour",          label: "useTour"               },
  { id: "tour-step",         label: "TourStep"              },
  { id: "tour-config",       label: "TourConfig"            },
  { id: "tour-controls",     label: "TourControls"          },
  { id: "jsx-content",       label: "JSX content"           },
  { id: "conditional-steps", label: "Conditional steps"     },
  { id: "can-advance",       label: "canAdvance guard"      },
  { id: "auto-advance",      label: "autoAdvanceAfter"      },
  { id: "analytics",         label: "Analytics hooks"       },
  { id: "restart",           label: "restart()"             },
  { id: "is-tour-active",    label: "useIsTourActive"       },
  { id: "persistence",       label: "Tour persistence"      },
  { id: "named-registry",    label: "Named tour registry"   },
  { id: "cross-route",       label: "Cross-route navigation"},
  { id: "action-driven",     label: "Action-driven tours"   },
  { id: "tour-provider",     label: "TourProvider"          },
  { id: "version",           label: "version + persist"     },
  { id: "persist-progress", label: "persistProgress"       },
  { id: "steps-url",        label: "stepsUrl"              },
  { id: "render-popover",   label: "renderPopover"         },
  { id: "tour-step-extras", label: "popoverless · section · mobileOverrides" },
  { id: "tour-sequence",    label: "useTourSequence"       },
  { id: "tour-step-hook",   label: "useTourStep"           },
  { id: "tour-beacon",      label: "TourBeacon"            },
  { id: "tour-checklist",   label: "TourChecklist"         },
  { id: "locales",          label: "Locales"               },
  { id: "step-ref",         label: "useStepRef"            },
  { id: "scroll-behavior",  label: "scrollBehavior"        },
  { id: "on-error",         label: "onError"               },
  { id: "debug",            label: "debug mode"            },
  { id: "skip-tour",        label: "skipTour"              },
  { id: "testing",          label: "Testing utilities"     },
  { id: "tour-provider",    label: "TourProvider"          },
  { id: "wait-for-element", label: "waitForElement"        },
  { id: "contributing",     label: "Contributing"          },
];

export default function DocsPage() {
  const [activeId, setActiveId] = useState(sections[0].id);

  useEffect(() => {
    const headings = sections
      .map(s => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      entries => {
        // Pick the topmost entry that is intersecting
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    headings.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="mx-auto flex max-w-6xl gap-8 px-6 py-10">

      {/* ── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="hidden w-52 shrink-0 lg:block">
        <nav className="sticky top-24 flex flex-col gap-0.5">
          <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">On this page</div>
          {sections.map(s => (
            <a key={s.id} href={`#${s.id}`}
              className={[
                "rounded-md px-3 py-1.5 text-sm no-underline transition-colors",
                activeId === s.id
                  ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
              ].join(" ")}>
              {s.label}
            </a>
          ))}
        </nav>
      </aside>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <main className="min-w-0 flex-1">
        <h1 className="mb-2 text-4xl font-black">Documentation</h1>
        <p className="mb-10 text-lg text-gray-500 dark:text-zinc-400">
          Complete API reference for <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm dark:bg-zinc-800">@oqlet/react-driver</code>.
        </p>

        {/* Installation */}
        <H2 id="installation">Installation</H2>
        <Code lang="bash" code={`npm install @oqlet/react-driver`} />
        <p className="text-gray-600 dark:text-zinc-400">
          That's it. <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">driver.js</code> is
          bundled as a dependency — you don't need to install it separately. Import the CSS once in your app entry:
        </p>
        <Code lang="tsx" code={`import "@oqlet/react-driver/driver.css";`} />

        {/* Quick start */}
        <H2 id="quick-start">Quick start</H2>
        <Code code={`import { useTour } from "@oqlet/react-driver";

function App() {
  const { start } = useTour({
    steps: [
      { target: "#save-btn",  title: "Save",  content: "Click here to save." },
      { target: "#share-btn", title: "Share", content: "Invite your team."   },
    ],
    onFinish: () => console.log("Tour complete!"),
  });

  return <button onClick={() => start()}>Start tour</button>;
}`} />

        {/* useTour */}
        <H2 id="use-tour">useTour(config)</H2>
        <p className="mb-4 text-gray-600 dark:text-zinc-400">
          The primary hook. Define your tour once and get back controls to drive it from anywhere in the component tree.
          Place it in a component that doesn't unmount during the tour (e.g. a layout component) for cross-route tours.
        </p>
        <Code code={`const { start, stop, next, prev, moveTo, isActive, currentStep } = useTour(config);`} />

        {/* TourStep */}
        <H2 id="tour-step">TourStep</H2>
        <p className="mb-4 text-gray-600 dark:text-zinc-400">Each element of the <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">steps</code> array.</p>

        <H3 id="tour-step-targeting">Targeting</H3>
        <PropTable rows={[
          { prop: "target",  type: "string | RefObject<Element>", desc: "CSS selector or React ref of the element to highlight. Omit for a floating centred popover." },
          { prop: "title",   type: "ReactNode", desc: "Popover heading. Accepts a string or any React node for rich content." },
          { prop: "content", type: "ReactNode", desc: "Popover body. Required. Accepts a string or any React node — images, buttons, videos." },
          { prop: "visibleWhen",       type: "() => boolean",                    desc: "Skip this step when the function returns false. Evaluated fresh on every start() call." },
          { prop: "canAdvance",        type: "() => boolean | Promise<boolean>", desc: "Guard the Next button. If it returns false the step stays active — the tour does not advance." },
          { prop: "autoAdvanceAfter",  type: "number",                           desc: "Automatically advance after N milliseconds. Cancelled immediately if the user navigates manually." },
          { prop: "side",    type: '"top" | "bottom" | "left" | "right"', desc: "Which side of the element the popover appears on." },
          { prop: "align",   type: '"start" | "center" | "end"', desc: "Popover alignment relative to the element." },
          { prop: "popoverClass", type: "string", desc: "Extra CSS class added to this step's popover." },
        ]} />

        <H3 id="tour-step-lifecycle">Lifecycle callbacks</H3>
        <PropTable rows={[
          { prop: "onBeforeHighlight", type: "() => void", desc: "Called just before this step is highlighted." },
          { prop: "onAfterHighlight",  type: "() => void", desc: "Called after this step is fully highlighted (after animation)." },
          { prop: "onDeselected",      type: "() => void", desc: "Called when leaving this step." },
        ]} />

        <H3 id="tour-step-navigation">Navigation hooks</H3>
        <PropTable rows={[
          { prop: "beforeNext",  type: "() => void | Promise<void>", desc: "Called before advancing. Return a Promise (e.g. navigate('/cart')) and the library waits for the next step's target to appear in the DOM before moving forward." },
          { prop: "afterNext",   type: "() => void", desc: "Called after the next step's animation completes. Safe to unmount the current step's element here — driver.js has already deselected it." },
          { prop: "beforePrev",  type: "() => void | Promise<void>", desc: "Mirror of beforeNext for back navigation." },
          { prop: "afterPrev",   type: "() => void", desc: "Called after the previous step's animation completes when the user clicks Back." },
          { prop: "advanceOn",   type: "string",  desc: "CSS selector. When the matching element is clicked during this step, the tour advances exactly as if the user pressed Next. The library owns the click (stops propagation) so state changes happen only through beforeNext." },
        ]} />

        <H3 id="tour-step-misc">Other</H3>
        <PropTable rows={[
          { prop: "preserveValue", type: "boolean", default: "false", desc: "Keep the field value when the step is hidden (applicable to form-wizard contexts)." },
        ]} />

        {/* TourConfig */}
        <H2 id="tour-config">TourConfig</H2>
        <p className="mb-4 text-gray-600 dark:text-zinc-400">Options passed to <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">useTour</code>.</p>
        <PropTable rows={[
          { prop: "steps",          type: "TourStep[]",           desc: "Required. Array of tour steps." },
          { prop: "id",             type: "string",               desc: "Unique identifier. Required for persist and useRegisterTour/useTourControls." },
          { prop: "persist",        type: "boolean | \"session\"",desc: "Skip tour after first completion. true = localStorage, \"session\" = sessionStorage. Requires id." },
          { prop: "showProgress",   type: "boolean",  default: "true",    desc: "Show step counter in the popover footer." },
          { prop: "animate",        type: "boolean",  default: "true",    desc: "Animate transitions between steps." },
          { prop: "overlayOpacity", type: "number",   default: "0.75",    desc: "Overlay darkness, 0–1." },
          { prop: "allowClose",     type: "boolean",  default: "true",    desc: "Allow closing via Escape or overlay click." },
          { prop: "overlayClass",   type: "string",                       desc: "Extra CSS class on the overlay." },
          { prop: "popoverClass",   type: "string",                       desc: "Extra CSS class on every popover." },
          { prop: "prevBtnText",    type: "string",   default: '"← Back"',  desc: "Previous button label." },
          { prop: "nextBtnText",    type: "string",   default: '"Next →"',  desc: "Next button label." },
          { prop: "doneBtnText",    type: "string",   default: '"Done"',    desc: "Done button label on the last step." },
          { prop: "waitForTarget",  type: "number",   default: "5000",    desc: "Milliseconds to wait for a step's target element to appear after beforeNext navigation." },
          { prop: "onStart",        type: "() => void",                   desc: "Called when the tour starts." },
          { prop: "onFinish",       type: "() => void",                   desc: "Called when all steps are completed." },
          { prop: "onSkip",         type: "() => void",                   desc: "Called when the tour is dismissed early." },
          { prop: "onStepChange",   type: "(index: number) => void",      desc: "Called on each step change with the zero-based index." },
          { prop: "onStepEnter",    type: "(index, { enteredAt, step }) => void", desc: "Analytics: fires when a step is fully visible (after animation)." },
          { prop: "onStepExit",     type: "(index, { duration, reason, step }) => void", desc: "Analytics: fires when leaving a step. reason is 'next' | 'prev' | 'skip' | 'close'." },
        ]} />

        {/* TourControls */}
        <H2 id="tour-controls">TourControls</H2>
        <p className="mb-4 text-gray-600 dark:text-zinc-400">The object returned by <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">useTour</code>.</p>
        <PropTable rows={[
          { prop: "start",       type: "(stepIndex?: number) => void", desc: "Start the tour, optionally from a specific step index." },
          { prop: "stop",        type: "() => void",    desc: "Immediately destroy the active tour." },
          { prop: "next",        type: "() => void",    desc: "Advance to the next step." },
          { prop: "prev",        type: "() => void",    desc: "Go back to the previous step." },
          { prop: "moveTo",      type: "(index: number) => void", desc: "Jump to any step by index." },
          { prop: "isActive",    type: "boolean",       desc: "true while the tour is running." },
          { prop: "currentStep", type: "number",        desc: "Zero-based index of the currently highlighted step (within visible steps only)." },
          { prop: "totalSteps",  type: "number",        desc: "Total number of visible steps after visibleWhen filtering. Use with currentStep for a custom progress bar." },
          { prop: "restart",     type: "() => void",    desc: "Restart the tour from step 0 without firing onSkip or onFinish. Useful for demo loops or re-triggering onboarding." },
        ]} />

        {/* JSX content */}
        <H2 id="jsx-content">JSX content</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Both <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">title</code> and{" "}
          <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">content</code> accept any{" "}
          <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">React.ReactNode</code> — images, videos, buttons, styled text, anything you can render in React.
          The library injects the React tree into driver.js's popover DOM using <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">createRoot</code> + <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">flushSync</code> and cleans up the root on step exit.
        </p>
        <Code code={`{ target: "#hero",
  title: <span className="text-blue-600">🎉 Welcome</span>,
  content: (
    <div>
      <p>Watch this 30-second intro:</p>
      <video src="/onboarding.mp4" controls width="100%" />
      <p className="mt-2 text-sm text-gray-500">Or skip and explore on your own.</p>
    </div>
  ),
}`} />

        {/* Conditional steps */}
        <H2 id="conditional-steps">Conditional steps</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Add <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">visibleWhen: () =&gt; boolean</code> to any step.
          It's evaluated fresh on every <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">start()</code> call — invisible steps are filtered
          out before driver.js sees them, so <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">currentStep</code> and <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">totalSteps</code> always reflect
          what's actually visible.
        </p>
        <Code code={`const { start } = useTour({
  steps: [
    { target: "#dashboard", content: "Your dashboard." },

    // Only shown to free-plan users
    { target: "#upgrade-banner",
      content: "Unlock all features with Pro.",
      visibleWhen: () => user.plan === "free" },

    // Only shown when a feature flag is on
    { target: "#new-editor",
      content: "Try our new editor!",
      visibleWhen: () => flags.newEditorEnabled },

    { target: "#settings", content: "Adjust your preferences." },
  ],
});`} />

        {/* canAdvance */}
        <H2 id="can-advance">canAdvance guard</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Add <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">canAdvance</code> to a step to
          gate the Next button on a condition. If it returns (or resolves to) <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">false</code> the
          step stays active silently — use your own UI to communicate why (shake the form, highlight a field, show a toast).
        </p>
        <Code code={`{ target: "#signup-form",
  content: "Fill in all required fields before continuing.",
  canAdvance: () => formRef.current?.checkValidity() ?? true,
  // Async works too — great for server-side validation
  canAdvance: async () => {
    const { valid } = await validateEmail(email);
    return valid;
  },
}`} />

        {/* autoAdvanceAfter */}
        <H2 id="auto-advance">autoAdvanceAfter</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Automatically advance after N milliseconds. Any user interaction (Next button, <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">advanceOn</code>) still works —
          the timer is cancelled the moment the step changes.
        </p>
        <Code code={`{ target: "#hero-banner",
  title: "Welcome",
  content: "This will move on in 5 seconds.",
  autoAdvanceAfter: 5000,
}`} />

        {/* Analytics */}
        <H2 id="analytics">Analytics hooks</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Track engagement per step — which steps users see, how long they spend, and why they leave.
        </p>
        <PropTable rows={[
          { prop: "onStepEnter", type: "(index, { enteredAt, step }) => void", desc: "Fires when a step becomes fully visible (after animation). enteredAt is a Unix timestamp." },
          { prop: "onStepExit",  type: "(index, { duration, reason, step }) => void", desc: `Fires when the user leaves a step. reason is 'next' | 'prev' | 'skip' | 'close'. duration is ms spent on the step.` },
        ]} />
        <Code code={`useTour({
  steps,
  onStepEnter: (i, { step }) =>
    analytics.track("tour_step_view", { step: i, title: String(step.title) }),
  onStepExit: (i, { duration, reason }) =>
    analytics.track("tour_step_exit", { step: i, duration, reason }),
});`} />

        {/* restart */}
        <H2 id="restart">restart()</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Resets the tour to step 0 without firing <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">onSkip</code> or <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">onFinish</code>. Useful for demos, preview modes, or letting users replay onboarding.
        </p>
        <Code code={`const { start, restart, isActive } = useTour({ steps });

// Loop the tour automatically
<button onClick={restart}>Watch again</button>

// Keyboard shortcut
useEffect(() => {
  const handler = (e: KeyboardEvent) => { if (e.key === "r") restart(); };
  window.addEventListener("keydown", handler);
  return () => window.removeEventListener("keydown", handler);
}, [restart]);`} />

        {/* useIsTourActive */}
        <H2 id="is-tour-active">useIsTourActive()</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Returns <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">true</code> when any tour registered inside the nearest{" "}
          <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">&lt;TourProvider&gt;</code> is running.
          Gate your UI during tours — hide chat bubbles, notifications, or other elements that compete for attention.
        </p>
        <Code code={`import { useIsTourActive } from "@oqlet/react-driver";

function ChatBubble() {
  const tourActive = useIsTourActive();
  if (tourActive) return null;  // hide chat widget during any tour
  return <IntercomBubble />;
}

function NotificationBanner() {
  const tourActive = useIsTourActive();
  return (
    <Banner
      style={{ opacity: tourActive ? 0 : 1, pointerEvents: tourActive ? "none" : "auto" }}
    />
  );
}`} />

        {/* Persistence */}
        <H2 id="persistence">Tour persistence</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Set <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">id</code> and{" "}
          <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">persist</code> to automatically skip a tour after first completion.
          <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800"> persist: true</code> uses localStorage (survives reloads),{" "}
          <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">"session"</code> uses sessionStorage (cleared on tab close).
        </p>
        <Code code={`// Won't re-show once completed
const { start } = useTour({
  id: "onboarding-v1",
  persist: true,
  steps: [...],
});`} />
        <p className="mb-3 text-gray-600 dark:text-zinc-400">Two utilities are exported for manual control:</p>
        <Code code={`import { hasSeenTour, clearTourHistory } from "@oqlet/react-driver";

// Gate other UI based on tour completion
if (!hasSeenTour("onboarding-v1")) {
  start();
}

// Reset one tour (e.g. after a major update)
clearTourHistory("onboarding-v1");

// Reset all tours
clearTourHistory();`} />

        {/* Named tour registry */}
        <H2 id="named-registry">Named tour registry</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Register a tour by name so any component can start it — no prop drilling. Requires{" "}
          <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">&lt;TourProvider&gt;</code>.
        </p>
        <Code code={`// In your layout (persists across navigations)
import { useRegisterTour } from "@oqlet/react-driver";

function Layout({ children }) {
  useRegisterTour("onboarding", {
    id: "onboarding",
    persist: true,
    steps: [...],
  });
  return <>{children}</>;
}`} />
        <Code code={`// In any component, however deep
import { useTourControls } from "@oqlet/react-driver";

function HelpButton() {
  const tour = useTourControls("onboarding");

  return (
    <button onClick={() => tour?.start()}>
      Take the tour
    </button>
  );
}`} />

        {/* Cross-route */}
        <H2 id="cross-route">Cross-route navigation</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Mount <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">useTour</code> in a persistent
          layout component (outside <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">&lt;Routes&gt;</code>)
          so the driver instance is never destroyed during navigation. Use <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">beforeNext</code> to
          navigate and the library waits for the next step's target automatically.
        </p>
        <Code code={`function Layout() {
  const navigate = useNavigate();

  const { start } = useTour({
    steps: [
      { target: "#product",     content: "Browse products." },
      { target: "#add-to-cart", content: "Add to cart.",
        beforeNext: () => navigate("/cart"),   // navigate on Next
        afterNext:  () => setCartOpen(false) }, // cleanup after animation
      { target: "#cart-item",   content: "Your item is here." },
    ],
    waitForTarget: 4000,
  });

  return (
    <>
      <button onClick={() => start()}>Start tour</button>
      <Routes>...</Routes>
    </>
  );
}`} />
        <p className="mt-3 text-sm text-gray-500 dark:text-zinc-400">
          <strong>Back navigation:</strong> use <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">beforePrev</code> on
          the first step of each new route to navigate back and let the library wait for the previous step's target.
        </p>

        {/* Action-driven */}
        <H2 id="action-driven">Action-driven tours</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">advanceOn</code> makes any element act as the "Next" button.
          When the user clicks it, the library fires <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">beforeNext</code> and
          waits for the next target — exactly like pressing Next manually.
        </p>
        <Code code={`{
  target: "#menu-edit-profile",
  title: "Edit profile",
  content: "Click it or press Next to continue.",
  advanceOn: "#menu-edit-profile",           // clicking the element = pressing Next
  beforeNext: () => setActivePanel("profile"), // runs for both click and Next button
  afterNext:  () => setMenuOpen(false),        // cleanup after animation — safe to unmount
}`} />

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm dark:border-amber-800/50 dark:bg-amber-950/20">
          <strong className="font-semibold text-amber-900 dark:text-amber-300">Important:</strong>
          <span className="ml-1 text-amber-800 dark:text-amber-400">
            <code className="font-mono">beforeNext</code> must NOT unmount the currently highlighted element before
            <code className="font-mono"> d.moveNext()</code> fires — driver.js would animate from a detached element.
            Use <code className="font-mono">afterNext</code> for cleanup instead: it fires only after the animation completes,
            so the previous element is already deselected and safe to remove.
          </span>
        </div>

        {/* version */}
        <H2 id="version">version + persist</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Pair <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">version</code> with <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">id + persist</code>.
          When you increment the version string, users who completed an older version will see the updated tour again — no manual cache clearing required.
        </p>
        <Code code={`useTour({ id: "onboarding", version: "2.0", persist: true, steps: [...] });
// Users who completed "1.0" will see this tour again.`} />

        {/* persistProgress */}
        <H2 id="persist-progress">persistProgress</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Resume the tour from the last step the user reached. Quit on step 4, come back — starts from step 4. Cleared automatically on tour finish.
        </p>
        <Code code={`useTour({ id: "onboarding", persistProgress: true, steps: [...] });`} />

        {/* stepsUrl */}
        <H2 id="steps-url">stepsUrl</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Fetch step config from an API at runtime. Marketing / product can update copy without a code deploy.
        </p>
        <Code code={`useTour({
  stepsUrl: "/api/tours/onboarding",
  stepsTransform: (data: any) => data.steps.map((s: any) => ({
    target: s.selector,
    title:  s.heading,
    content: s.body,
  })),
  onError: (err, ctx) => Sentry.captureException(err, { extra: { ctx } }),
});`} />

        {/* renderPopover */}
        <H2 id="render-popover">renderPopover</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Replace driver.js's default popover with your own React component. Receives <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">{"{ step, stepIndex, totalSteps, next, prev, stop, isFirst, isLast }"}</code>.
        </p>
        <Code code={`useTour({
  renderPopover: ({ step, next, stop, isLast, stepIndex, totalSteps }) => (
    <div className="my-popover">
      <h3>{step.title}</h3>
      <p>{step.content}</p>
      <span>{stepIndex + 1} / {totalSteps}</span>
      <button onClick={stop}>×</button>
      <button onClick={next}>{isLast ? "Finish" : "Next"}</button>
    </div>
  ),
  steps: [...],
});`} />

        {/* TourStep extras */}
        <H2 id="tour-step-extras">popoverless · section · mobileOverrides</H2>
        <PropTable rows={[
          { prop: "popoverless",    type: "boolean",                    desc: "Highlight the element with no popover — pure visual spotlight." },
          { prop: "section",        type: "string",                     desc: "Group label shown as a header in <TourChecklist> when the label changes between steps." },
          { prop: "mobileOverrides",type: "Partial<TourStep>",          desc: "Override any step props on narrow screens (below TourConfig.breakpoint, default 768px)." },
        ]} />
        <Code code={`[
  { section: "Setup",   target: "#profile", content: "Fill in your profile.",
    mobileOverrides: { side: "bottom", content: "Tap to edit." } },
  { section: "Explore", target: "#dashboard", content: "Your main workspace.",
    popoverless: true },  // spotlight only, no popover
]`} />

        {/* useTourSequence */}
        <H2 id="tour-sequence">useTourSequence</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Chain named tours end-to-end. When one finishes the next starts automatically. Requires <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">&lt;TourProvider&gt;</code>.
        </p>
        <Code code={`useRegisterTour("setup",     setupConfig);
useRegisterTour("dashboard", dashboardConfig);

const { startSequence, stopSequence, currentTour } =
  useTourSequence(["setup", "dashboard"]);

<button onClick={startSequence}>Start full onboarding</button>`} />

        {/* useTourStep */}
        <H2 id="tour-step-hook">useTourStep(stepIndex)</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Know from any component whether a specific step is active. Useful for highlighting nav items or rendering inline hints. Requires <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">&lt;TourProvider&gt;</code>.
        </p>
        <Code code={`function NavItem({ label, step }: { label: string; step: number }) {
  const { isActive } = useTourStep(step);
  return <li style={{ outline: isActive ? "2px solid #3b82f6" : "none" }}>{label}</li>;
}`} />

        {/* TourBeacon */}
        <H2 id="tour-beacon">TourBeacon</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          A pulsing dot anchored to any element. Clicking it starts the specified named tour. Non-intrusive — draws attention without interrupting the user. Requires <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">&lt;TourProvider&gt;</code> and a registered tour.
        </p>
        <Code code={`import { TourBeacon } from "@oqlet/react-driver";

useRegisterTour("feature-x", featureXConfig);

<TourBeacon
  target="#new-dashboard"
  tourId="feature-x"
  position="top-right"   // "top-right" | "top-left" | "bottom-right" | "bottom-left"
/>`} />

        {/* TourChecklist */}
        <H2 id="tour-checklist">TourChecklist</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          A side-panel progress list. Steps with a <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">section</code> prop are grouped under headers. Clicking a step jumps to it.
        </p>
        <Code code={`const { start, moveTo, currentStep, isActive } = useTour({ steps });

<TourChecklist
  steps={steps}
  currentStep={currentStep}
  isActive={isActive}
  onJumpTo={moveTo}
  title="Getting started"
/>`} />

        {/* Locales */}
        <H2 id="locales">Locales</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Pre-built locale configs for 13 languages. Spread into <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">useTour</code> to set button labels.
          Available: <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">en fr es de pt it nl ja zh ko ar ru hi</code>.
        </p>
        <Code code={`import { locales } from "@oqlet/react-driver";

useTour({ ...locales.fr, steps: [...] });
// prevBtnText: "← Retour", nextBtnText: "Suivant →", doneBtnText: "Terminer"`} />

        {/* useStepRef */}
        <H2 id="step-ref">useStepRef(id)</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Refactor-safe element targeting. Returns a <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">ref</code> to attach to an element and a <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">target</code> CSS selector. Safe to rename IDs and classes freely.
        </p>
        <Code code={`const { ref, target } = useStepRef("save-btn");

<button ref={ref}>Save</button>

// In tour config:
{ target, content: "Click here to save." }
// target = '[data-tour-ref="save-btn"]'`} />

        {/* scrollBehavior */}
        <H2 id="scroll-behavior">scrollBehavior</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Control how driver.js scrolls to bring highlighted elements into view.
        </p>
        <PropTable rows={[
          { prop: "scrollBehavior", type: '"smooth" | "instant" | false', default: '"smooth"', desc: 'smooth = animated scroll, instant = immediate jump, false = disable scrolling.' },
        ]} />

        {/* onError */}
        <H2 id="on-error">onError</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Called when a recoverable error occurs — <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">stepsUrl</code> fetch failures, <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">waitForElement</code> timeouts, and more.
        </p>
        <Code code={`useTour({
  onError: (err, context) => {
    analytics.track("tour_error", { message: err.message, context });
  },
  steps: [...],
});`} />

        {/* debug */}
        <H2 id="debug">debug mode</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Set <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">debug: true</code> on <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">TourConfig</code> to log every step transition, duration, and reason to the console. Never ship to production.
        </p>
        <Code code={`useTour({ debug: process.env.NODE_ENV === "development", steps: [...] });`} />

        {/* skipTour */}
        <H2 id="skip-tour">skipTour(id)</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Mark a tour as seen without the user completing it. Useful in admin panels, test environments, or a "Skip onboarding" button.
        </p>
        <Code code={`import { skipTour } from "@oqlet/react-driver";

<button onClick={() => skipTour("onboarding")}>Skip onboarding</button>`} />

        {/* Testing utilities */}
        <H2 id="testing">Testing utilities</H2>
        <p className="mb-3 text-gray-600 dark:text-zinc-400">
          Import from <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">@oqlet/react-driver/testing</code> to get a stub <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">TourControls</code> for unit tests — no driver.js setup required.
        </p>
        <Code code={`import { createMockTour } from "@oqlet/react-driver/testing";
import { vi } from "vitest";

const mockTour = createMockTour({ isActive: true });
vi.mock("@oqlet/react-driver", () => ({ useTour: () => mockTour }));

// Assert your component wires up correctly
expect(mockTour.start).toHaveBeenCalledWith(0);`} />

        {/* TourProvider */}
        <H2 id="tour-provider">TourProvider</H2>
        <p className="mb-4 text-gray-600 dark:text-zinc-400">
          Optional. Wrap your app root with <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">&lt;TourProvider&gt;</code> when
          you have multiple tours — it coordinates them so only one runs at a time and exposes <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800">activeTourId</code> anywhere in the tree.
          Single-tour apps work fine without it.
        </p>
        <Code code={`import { TourProvider, useTour, useTourContext } from "@oqlet/react-driver";

function Root() {
  return (
    <TourProvider>
      <App />
    </TourProvider>
  );
}

// Read active tour state from anywhere
function StatusBar() {
  const { activeTourId } = useTourContext() ?? {};
  return activeTourId ? <div>Tour running: {activeTourId}</div> : null;
}`} />

        {/* waitForElement */}
        <H2 id="wait-for-element">waitForElement</H2>
        <p className="mb-4 text-gray-600 dark:text-zinc-400">
          The library exports the utility it uses internally to wait for DOM elements. You can use it in custom
          <code className="rounded bg-gray-100 px-1 font-mono text-sm dark:bg-zinc-800"> beforeNext</code> callbacks
          when you need to wait for something beyond just the next step's target.
        </p>
        <Code code={`import { waitForElement } from "@oqlet/react-driver";

beforeNext: async () => {
  await navigate("/dashboard");
  await waitForElement("#analytics-chart", 6000); // wait up to 6s
}`} />

        {/* Contributing */}
        <H2 id="contributing">Contributing</H2>
        <Code lang="bash" code={`git clone https://github.com/goutham-05/react-driver
cd react-driver
npm install
npm test        # vitest — 19 tests
npm run build   # tsup — ESM + CJS + .d.ts + .d.cts + driver.css`} />
        <p className="text-sm text-gray-500 dark:text-zinc-400">
          Issues and pull requests are welcome. Please open an issue first for significant changes.
        </p>
      </main>
    </div>
  );
}
