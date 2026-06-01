import React, { useState, useEffect, useRef } from "react";

// ── Helpers ───────────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="rounded px-2 py-1 text-[11px] font-semibold text-zinc-500 transition-all hover:text-zinc-200"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function Code({ code, lang = "tsx" }: { code: string; lang?: string }) {
  return (
    <div className="group my-5 overflow-hidden rounded-xl border border-zinc-800 bg-[#0d1117] shadow-lg">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2">
        <span className="font-mono text-[11px] font-medium text-zinc-500 uppercase tracking-widest">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-5 text-[13px] leading-relaxed text-zinc-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function PropTable({ rows }: { rows: { prop: string; type: string; default?: string; desc: string }[] }) {
  return (
    <div className="my-5 overflow-x-auto rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900/80">
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-400">Prop</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-400">Type</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-400">Default</th>
            <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-zinc-400">Description</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/50">
          {rows.map((r) => (
            <tr key={r.prop} className="bg-white hover:bg-gray-50/50 dark:bg-zinc-950 dark:hover:bg-zinc-900/50 transition-colors">
              <td className="px-4 py-3 font-mono text-[13px] font-semibold text-blue-700 dark:text-blue-400 whitespace-nowrap">{r.prop}</td>
              <td className="px-4 py-3 font-mono text-[11px] text-violet-700 dark:text-violet-400 whitespace-nowrap">{r.type}</td>
              <td className="px-4 py-3 font-mono text-[11px] text-gray-600 dark:text-zinc-500 whitespace-nowrap">{r.default ?? "—"}</td>
              <td className="px-4 py-3 text-[13px] text-gray-700 dark:text-zinc-400">{r.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="group mb-3 mt-14 scroll-mt-24 text-2xl font-bold text-gray-900 dark:text-white first:mt-0">
      <a href={`#${id}`} className="no-underline">
        {children}
        <span className="ml-2 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity dark:text-zinc-600">#</span>
      </a>
    </h2>
  );
}

function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="mb-2 mt-8 scroll-mt-24 text-base font-bold text-gray-800 dark:text-zinc-200">
      {children}
    </h3>
  );
}

function Callout({ type = "info", children }: { type?: "info" | "warning" | "tip"; children: React.ReactNode }) {
  const styles = {
    info:    "border-blue-200 bg-blue-50 dark:border-blue-800/50 dark:bg-blue-950/20",
    warning: "border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/20",
    tip:     "border-emerald-200 bg-emerald-50 dark:border-emerald-800/50 dark:bg-emerald-950/20",
  };
  const icons = { info: "ℹ️", warning: "⚠️", tip: "💡" };
  return (
    <div className={`my-5 flex gap-3 rounded-xl border p-4 text-sm ${styles[type]}`}>
      <span className="text-base shrink-0 mt-0.5">{icons[type]}</span>
      <div className="text-gray-700 dark:text-zinc-300">{children}</div>
    </div>
  );
}

function IC({ children }: { children: string }) {
  return <code className="rounded-md bg-gray-100 px-1.5 py-0.5 font-mono text-[12px] text-gray-800 dark:bg-zinc-800 dark:text-zinc-200">{children}</code>;
}

// ── Navigation structure ──────────────────────────────────────────────────────

interface NavItem  { id: string; label: string }
interface NavGroup { title: string; items: NavItem[] }

const NAV_GROUPS: NavGroup[] = [
  {
    title: "Getting started",
    items: [
      { id: "installation", label: "Installation" },
      { id: "quick-start",  label: "Quick start"  },
    ],
  },
  {
    title: "Core API",
    items: [
      { id: "use-tour",      label: "useTour"      },
      { id: "tour-step",     label: "TourStep"     },
      { id: "tour-config",   label: "TourConfig"   },
      { id: "tour-controls", label: "TourControls" },
    ],
  },
  {
    title: "Tour flow",
    items: [
      { id: "conditional-steps", label: "Conditional steps"  },
      { id: "can-advance",       label: "canAdvance"         },
      { id: "auto-advance",      label: "autoAdvanceAfter"   },
      { id: "restart",           label: "restart()"          },
      { id: "jsx-content",       label: "JSX content"        },
      { id: "render-popover",    label: "renderPopover"      },
    ],
  },
  {
    title: "Visual & display",
    items: [
      { id: "tour-step-extras", label: "popoverless · section" },
      { id: "scroll-behavior",  label: "scrollBehavior"        },
      { id: "ux-extras",        label: "keyboard · delayAfter" },
    ],
  },
  {
    title: "Navigation",
    items: [
      { id: "cross-route",   label: "Cross-route"   },
      { id: "action-driven", label: "Action-driven" },
    ],
  },
  {
    title: "Persistence",
    items: [
      { id: "persistence",      label: "persist"         },
      { id: "version",          label: "version"         },
      { id: "persist-progress", label: "persistProgress" },
      { id: "show-count",       label: "showCount"       },
      { id: "show-after",       label: "showAfter"       },
      { id: "skip-tour",        label: "skipTour"        },
    ],
  },
  {
    title: "Hooks",
    items: [
      { id: "is-tour-active", label: "useIsTourActive"  },
      { id: "tour-step-hook", label: "useTourStep"      },
      { id: "named-registry", label: "Named registry"   },
      { id: "tour-sequence",  label: "useTourSequence"  },
      { id: "tour-history",   label: "useTourHistory"   },
      { id: "tour-analytics", label: "useTourAnalytics" },
    ],
  },
  {
    title: "Components",
    items: [
      { id: "tour-beacon",    label: "TourBeacon"    },
      { id: "tour-checklist", label: "TourChecklist" },
      { id: "tour-tooltip",   label: "TourTooltip"   },
      { id: "tour-provider",  label: "TourProvider"  },
    ],
  },
  {
    title: "Analytics",
    items: [
      { id: "analytics", label: "onStepEnter/Exit" },
      { id: "adapters",  label: "Adapters"         },
    ],
  },
  {
    title: "Config & utilities",
    items: [
      { id: "debug",           label: "debug"          },
      { id: "on-error",        label: "onError"        },
      { id: "steps-url",       label: "stepsUrl"       },
      { id: "locales",         label: "Locales"        },
      { id: "step-ref",        label: "useStepRef"     },
      { id: "wait-for-element",label: "waitForElement" },
      { id: "testing",         label: "Testing"        },
      { id: "cdn",             label: "CDN / UMD"      },
    ],
  },
  {
    title: "Project",
    items: [{ id: "contributing", label: "Contributing" }],
  },
];

const ALL_SECTIONS: NavItem[] = NAV_GROUPS.flatMap(g => g.items);

// ── Sidebar ───────────────────────────────────────────────────────────────────

function Sidebar({ activeId, onNavClick, onSelectId, onClose }: {
  activeId: string;
  onNavClick?: () => void;
  onSelectId?: (id: string) => void;
  onClose?: () => void;
}) {
  const [query, setQuery] = useState("");
  const navRef = useRef<HTMLElement>(null);

  // Keep the active item visible inside the sidebar scroll container.
  useEffect(() => {
    if (!navRef.current) return;
    const el = navRef.current.querySelector<HTMLElement>(`[data-section-id="${activeId}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);
  const q = query.toLowerCase().trim();

  const filtered = q
    ? NAV_GROUPS.map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(q)) }))
        .filter(g => g.items.length > 0)
    : NAV_GROUPS;

  return (
    <div className="flex h-full flex-col">
      {/* Search */}
      <div className="shrink-0 border-b border-gray-100 px-4 pb-3 pt-4 dark:border-zinc-800">
        <div className="relative">
          <svg className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-500 dark:text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search docs…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm outline-none transition-colors placeholder:text-gray-400 focus:border-blue-400 focus:bg-white focus:ring-1 focus:ring-blue-400/30 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-600 dark:text-zinc-300 dark:focus:border-blue-500"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600 dark:text-zinc-500 dark:hover:text-zinc-300">
              ×
            </button>
          )}
        </div>
      </div>

      {/* Nav groups */}
      <nav ref={navRef} className="flex-1 overflow-y-auto px-3 py-3">
        {filtered.length === 0 && (
          <p className="px-3 py-4 text-center text-sm text-gray-400 dark:text-zinc-600">No results for "{query}"</p>
        )}
        {filtered.map(group => (
          <div key={group.title} className="mb-4">
            <div className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-zinc-500">
              {group.title}
            </div>
            {group.items.map(item => (
              <a
                key={item.id}
                href={`#${item.id}`}
                data-section-id={item.id}
                onClick={() => { onNavClick?.(); onSelectId?.(item.id); onClose?.(); }}
              className={[
                  "flex items-center rounded-lg px-3 py-1.5 text-[13px] no-underline transition-all",
                  activeId === item.id
                    ? "bg-blue-50 font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100",
                ].join(" ")}
              >
                {activeId === item.id && (
                  <span className="mr-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-blue-400" />
                )}
                {item.label}
              </a>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  const [activeId, setActiveId] = useState(ALL_SECTIONS[0].id);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Pause the observer while a nav-link scroll is in progress so the
  // IntersectionObserver doesn't hijack the active section mid-animation.
  const observerPausedRef = useRef(false);
  const pauseTimerRef     = useRef<ReturnType<typeof setTimeout> | null>(null);

  const pauseObserver = () => {
    observerPausedRef.current = true;
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    pauseTimerRef.current = setTimeout(() => {
      observerPausedRef.current = false;
    }, 1000); // resume after scroll animation settles (~600ms typical)
  };

  // Active section tracking via IntersectionObserver
  useEffect(() => {
    const headings = ALL_SECTIONS
      .map(s => document.getElementById(s.id))
      .filter(Boolean) as HTMLElement[];

    const observer = new IntersectionObserver(
      entries => {
        if (observerPausedRef.current) return; // skip during nav-link scrolls
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-16% 0px -72% 0px", threshold: 0 }
    );

    headings.forEach(el => observer.observe(el));
    return () => { observer.disconnect(); if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current); };
  }, []);

  // Close mobile sidebar on Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [mobileOpen]);

  // Determine prev / next for bottom navigation
  const currentIdx = ALL_SECTIONS.findIndex(s => s.id === activeId);
  const prevSection = currentIdx > 0 ? ALL_SECTIONS[currentIdx - 1] : null;
  const nextSection = currentIdx < ALL_SECTIONS.length - 1 ? ALL_SECTIONS[currentIdx + 1] : null;

  return (
    <div className="relative min-h-screen bg-white dark:bg-zinc-950">

      {/* ── Mobile sidebar toggle ─────────────────────────────────────────── */}
      <div className="sticky top-14 z-30 flex h-10 items-center border-b border-gray-100 bg-white/95 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 rounded-md px-2 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          <span className="font-medium">
            {ALL_SECTIONS.find(s => s.id === activeId)?.label ?? "Menu"}
          </span>
        </button>
      </div>

      {/* ── Mobile overlay ────────────────────────────────────────────────── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
              <span className="font-bold text-gray-900 dark:text-white">Docs</span>
              <button onClick={() => setMobileOpen(false)} className="text-gray-500 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-white">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="h-[calc(100%-3rem)]">
              <Sidebar activeId={activeId} onNavClick={pauseObserver} onSelectId={setActiveId} onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-7xl">

        {/* ── Desktop sidebar ─────────────────────────────────────────────── */}
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-14 h-[calc(100vh-3.5rem)] border-r border-gray-100 dark:border-zinc-800">
            <Sidebar activeId={activeId} onNavClick={pauseObserver} onSelectId={setActiveId} />
          </div>
        </aside>

        {/* ── Main content ────────────────────────────────────────────────── */}
        <main className="min-w-0 flex-1 px-6 py-10 lg:px-10 xl:px-16">

          {/* Page header */}
          <div className="mb-10 border-b border-gray-100 pb-8 dark:border-zinc-800">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
              API Reference
            </div>
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white">Documentation</h1>
            <p className="mt-2 text-lg text-gray-700 dark:text-zinc-400">
              Complete API reference for <IC>@oqlet/react-driver</IC>.
            </p>
          </div>

          {/* ── Installation ──────────────────────────────────────────────── */}
          <H2 id="installation">Installation</H2>
          <Code lang="bash" code={`npm install @oqlet/react-driver`} />
          <p className="text-gray-600 dark:text-zinc-400">
            <IC>driver.js</IC> is bundled — no separate install. Import the CSS once in your app entry:
          </p>
          <Code lang="tsx" code={`import "@oqlet/react-driver/driver.css";`} />

          {/* ── Quick start ───────────────────────────────────────────────── */}
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

          {/* ── useTour ───────────────────────────────────────────────────── */}
          <H2 id="use-tour">useTour(config)</H2>
          <p className="mb-4 text-gray-700 dark:text-zinc-400">
            The primary hook. Define your tour once and get back controls to drive it from anywhere in the component tree.
            Place it in a component that doesn't unmount during the tour (e.g. a layout component) for cross-route tours.
          </p>
          <Code code={`const { start, stop, restart, next, prev, moveTo, isActive, currentStep, totalSteps } = useTour(config);`} />

          {/* ── TourStep ──────────────────────────────────────────────────── */}
          <H2 id="tour-step">TourStep</H2>
          <p className="mb-4 text-gray-700 dark:text-zinc-400">Each element of the <IC>steps</IC> array.</p>

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
            { prop: "beforeNext",  type: "() => void | Promise<void>", desc: "Called before advancing. Return a Promise (e.g. navigate('/cart')) and the library waits for the next step's target to appear in the DOM." },
            { prop: "afterNext",   type: "() => void", desc: "Called after the next step's animation completes. Safe to unmount this step's DOM elements here." },
            { prop: "beforePrev",  type: "() => void | Promise<void>", desc: "Mirror of beforeNext for back navigation." },
            { prop: "afterPrev",   type: "() => void", desc: "Called after the previous step's animation completes when the user clicks Back." },
            { prop: "advanceOn",   type: "string",  desc: "CSS selector. When the matching element is clicked, the tour advances exactly like pressing Next. The library owns the click via stopPropagation." },
          ]} />

          {/* ── TourConfig ────────────────────────────────────────────────── */}
          <H2 id="tour-config">TourConfig</H2>
          <p className="mb-4 text-gray-700 dark:text-zinc-400">Options passed to <IC>useTour</IC>.</p>
          <PropTable rows={[
            { prop: "steps",          type: "TourStep[]",           desc: "Required. Array of tour steps." },
            { prop: "id",             type: "string",               desc: "Unique identifier. Required for persist and useRegisterTour/useTourControls." },
            { prop: "persist",        type: "boolean | \"session\"",desc: "Skip tour after first completion. true = localStorage, \"session\" = sessionStorage. Requires id." },
            { prop: "showProgress",   type: "boolean",  default: "true",    desc: "Show step counter in the popover footer." },
            { prop: "animate",        type: "boolean",  default: "true",    desc: "Animate transitions between steps." },
            { prop: "overlayOpacity", type: "number",   default: "0.75",    desc: "Overlay darkness, 0–1." },
            { prop: "allowClose",     type: "boolean",  default: "true",    desc: "Allow closing via Escape or overlay click." },
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

          {/* ── TourControls ──────────────────────────────────────────────── */}
          <H2 id="tour-controls">TourControls</H2>
          <p className="mb-4 text-gray-700 dark:text-zinc-400">The object returned by <IC>useTour</IC>.</p>
          <PropTable rows={[
            { prop: "start",       type: "(stepIndex?: number) => void", desc: "Start the tour, optionally from a specific step index." },
            { prop: "stop",        type: "() => void",    desc: "Immediately destroy the active tour." },
            { prop: "restart",     type: "() => void",    desc: "Restart from step 0 without firing onSkip or onFinish." },
            { prop: "next",        type: "() => void",    desc: "Advance to the next step." },
            { prop: "prev",        type: "() => void",    desc: "Go back to the previous step." },
            { prop: "moveTo",      type: "(index: number) => void", desc: "Jump to any step by index." },
            { prop: "isActive",    type: "boolean",       desc: "true while the tour is running." },
            { prop: "currentStep", type: "number",        desc: "Zero-based index of the currently highlighted step (within visible steps only)." },
            { prop: "totalSteps",  type: "number",        desc: "Total visible steps after visibleWhen filtering." },
          ]} />

          {/* ── Conditional steps ─────────────────────────────────────────── */}
          <H2 id="conditional-steps">Conditional steps</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Add <IC>visibleWhen: () =&gt; boolean</IC> to any step. Evaluated fresh on every <IC>start()</IC> call — invisible steps are filtered out before driver.js sees them, so <IC>currentStep</IC> and <IC>totalSteps</IC> always reflect what's actually visible.
          </p>
          <Code code={`useTour({
  steps: [
    { target: "#dashboard", content: "Your dashboard." },
    { target: "#upgrade-banner",
      content: "Unlock all features with Pro.",
      visibleWhen: () => user.plan === "free" },
    { target: "#new-editor",
      content: "Try our new editor!",
      visibleWhen: () => flags.newEditorEnabled },
    { target: "#settings", content: "Adjust your preferences." },
  ],
});`} />

          {/* ── canAdvance ────────────────────────────────────────────────── */}
          <H2 id="can-advance">canAdvance guard</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Gate the Next button on a condition. If it returns (or resolves to) <IC>false</IC> the step stays active silently — use your own UI to communicate why.
          </p>
          <Code code={`{ target: "#signup-form",
  content: "Fill in all required fields before continuing.",
  canAdvance: () => formRef.current?.checkValidity() ?? true,
  // Async works too
  canAdvance: async () => { const { valid } = await validateEmail(email); return valid; },
}`} />

          {/* ── autoAdvanceAfter ──────────────────────────────────────────── */}
          <H2 id="auto-advance">autoAdvanceAfter</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Automatically advance after N milliseconds. Any user interaction still works — the timer is cancelled the moment the step changes.
          </p>
          <Code code={`{ target: "#hero-banner", title: "Welcome",
  content: "This will move on in 5 seconds.",
  autoAdvanceAfter: 5000,
}`} />

          {/* ── restart() ─────────────────────────────────────────────────── */}
          <H2 id="restart">restart()</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Resets the tour to step 0 without firing <IC>onSkip</IC> or <IC>onFinish</IC>. Useful for demos, preview modes, or letting users replay onboarding.
          </p>
          <Code code={`const { start, restart } = useTour({ steps });

<button onClick={restart}>Watch again</button>`} />

          {/* ── JSX content ───────────────────────────────────────────────── */}
          <H2 id="jsx-content">JSX content</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Both <IC>title</IC> and <IC>content</IC> accept any <IC>React.ReactNode</IC> — images, videos, buttons, styled text, anything you can render in React.
          </p>
          <Code code={`{ target: "#hero",
  title: <span className="text-blue-600">🎉 Welcome</span>,
  content: (
    <div>
      <p>Watch this 30-second intro:</p>
      <video src="/onboarding.mp4" controls width="100%" />
    </div>
  ),
}`} />

          {/* ── renderPopover ─────────────────────────────────────────────── */}
          <H2 id="render-popover">renderPopover</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Replace driver.js's default popover with your own React component. Receives <IC>{"{ step, stepIndex, totalSteps, next, prev, stop, isFirst, isLast }"}</IC>.
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

          {/* ── TourStep extras ───────────────────────────────────────────── */}
          <H2 id="tour-step-extras">popoverless · section · mobileOverrides</H2>
          <PropTable rows={[
            { prop: "popoverless",    type: "boolean",           desc: "Highlight the element with no popover — pure visual spotlight." },
            { prop: "section",        type: "string",            desc: "Group label shown as a header in <TourChecklist> when the label changes between steps." },
            { prop: "mobileOverrides",type: "Partial<TourStep>", desc: "Override any step props on narrow screens (below TourConfig.breakpoint, default 768px)." },
          ]} />
          <Code code={`[
  { section: "Setup",   target: "#profile", content: "Fill in your profile.",
    mobileOverrides: { side: "bottom", content: "Tap to edit." } },
  { section: "Explore", target: "#dashboard", content: "Your main workspace.",
    popoverless: true },
]`} />

          {/* ── scrollBehavior ────────────────────────────────────────────── */}
          <H2 id="scroll-behavior">scrollBehavior</H2>
          <PropTable rows={[
            { prop: "scrollBehavior", type: '"smooth" | "instant" | false', default: '"smooth"', desc: 'smooth = animated scroll, instant = immediate jump, false = disable scrolling.' },
          ]} />

          {/* ── delayAfter / keyboard ─────────────────────────────────────── */}
          <H2 id="ux-extras">keyboard · delayAfter · highlightPadding · waitForIdle</H2>
          <PropTable rows={[
            { prop: "keyboard",         type: "{ enabled?, next?, prev?, close? }", desc: "Disable keyboard nav or remap keys. keyboard: { enabled: false } turns it off entirely." },
            { prop: "delayAfter",       type: "number (TourStep)",   desc: "Wait N ms after Next is clicked before advancing. Lets exit animations finish." },
            { prop: "highlightPadding", type: "number",              desc: "Extra px between element and overlay cutout. Set on TourConfig (global) or TourStep (per-step)." },
            { prop: "waitForIdle",      type: "boolean | number",    desc: "Wait for requestIdleCallback before starting. true = 2 s timeout, number = custom timeout ms." },
          ]} />

          {/* ── Cross-route ───────────────────────────────────────────────── */}
          <H2 id="cross-route">Cross-route navigation</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Mount <IC>useTour</IC> in a persistent layout component (outside <IC>&lt;Routes&gt;</IC>) so the driver instance is never destroyed during navigation.
          </p>
          <Code code={`function Layout() {
  const navigate = useNavigate();
  const { start } = useTour({
    steps: [
      { target: "#product",     content: "Browse products." },
      { target: "#add-to-cart", content: "Add to cart.",
        beforeNext: () => navigate("/cart"),
        afterNext:  () => setCartOpen(false) },
      { target: "#cart-item",   content: "Your item is here." },
    ],
    waitForTarget: 4000,
  });
  return <><button onClick={() => start()}>Start tour</button><Routes /></>;
}`} />

          {/* ── Action-driven ─────────────────────────────────────────────── */}
          <H2 id="action-driven">Action-driven tours</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            <IC>advanceOn</IC> makes any element act as the Next button. The library owns the click via <IC>stopPropagation</IC> so state changes happen only through <IC>beforeNext</IC>.
          </p>
          <Code code={`{
  target: "#menu-edit-profile",
  content: "Click it or press Next to continue.",
  advanceOn: "#menu-edit-profile",
  beforeNext: () => setActivePanel("profile"),
  afterNext:  () => setMenuOpen(false),
}`} />
          <Callout type="warning">
            <strong>Important:</strong> <IC>beforeNext</IC> must NOT unmount the currently highlighted element before <IC>d.moveNext()</IC> fires. Use <IC>afterNext</IC> for cleanup — it fires only after the animation completes, so the previous element is already deselected and safe to remove.
          </Callout>

          {/* ── Persistence ───────────────────────────────────────────────── */}
          <H2 id="persistence">Tour persistence</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Set <IC>id</IC> and <IC>persist</IC> to automatically skip a tour after first completion.
          </p>
          <Code code={`useTour({ id: "onboarding-v1", persist: true, steps: [...] });

import { hasSeenTour, clearTourHistory } from "@oqlet/react-driver";
if (!hasSeenTour("onboarding-v1")) start();
clearTourHistory("onboarding-v1"); // reset one tour
clearTourHistory();                // reset all tours`} />

          {/* ── version ───────────────────────────────────────────────────── */}
          <H2 id="version">version</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Pair with <IC>id + persist</IC>. When you increment the version string, users who completed an older version will see the updated tour again.
          </p>
          <Code code={`useTour({ id: "onboarding", version: "2.0", persist: true, steps: [...] });`} />

          {/* ── persistProgress ───────────────────────────────────────────── */}
          <H2 id="persist-progress">persistProgress</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Resume the tour from the last step the user reached. Cleared automatically on tour finish.
          </p>
          <Code code={`useTour({ id: "onboarding", persistProgress: true, steps: [...] });`} />

          {/* ── showCount ─────────────────────────────────────────────────── */}
          <H2 id="show-count">showCount</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Show a tour at most N times. Different from <IC>persist</IC> (all-or-nothing) — useful for re-engagement hints.
          </p>
          <Code code={`useTour({ id: "feature-hint", showCount: 3, steps: [...] });`} />

          {/* ── showAfter ─────────────────────────────────────────────────── */}
          <H2 id="show-after">showAfter — scheduling</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Automatically start the tour when a condition is met. All conditions must pass together.
          </p>
          <Code code={`useTour({
  id: "onboarding",
  showAfter: { delay: 5000 },            // 5 s after mount
  showAfter: { visits: 3 },              // from the 3rd page visit
  showAfter: { date: "2026-09-01" },     // from a release date
  showAfter: { visits: 2, delay: 3000 }, // 3 s after the 2nd visit
  steps: [...],
});`} />

          {/* ── skipTour ──────────────────────────────────────────────────── */}
          <H2 id="skip-tour">skipTour(id)</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Mark a tour as seen without completing it. Useful in admin panels or a "Skip onboarding" button.
          </p>
          <Code code={`import { skipTour } from "@oqlet/react-driver";

<button onClick={() => skipTour("onboarding")}>Skip onboarding</button>`} />

          {/* ── useIsTourActive ───────────────────────────────────────────── */}
          <H2 id="is-tour-active">useIsTourActive()</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Returns <IC>true</IC> when any tour inside the nearest <IC>&lt;TourProvider&gt;</IC> is running. Gate competing UI elements.
          </p>
          <Code code={`function ChatBubble() {
  const tourActive = useIsTourActive();
  if (tourActive) return null;
  return <IntercomBubble />;
}`} />

          {/* ── useTourStep ───────────────────────────────────────────────── */}
          <H2 id="tour-step-hook">useTourStep(stepIndex)</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Know from any component whether a specific step is active. Useful for highlighting nav items. Requires <IC>&lt;TourProvider&gt;</IC>.
          </p>
          <Code code={`function NavItem({ label, step }: { label: string; step: number }) {
  const { isActive } = useTourStep(step);
  return <li style={{ outline: isActive ? "2px solid #3b82f6" : "none" }}>{label}</li>;
}`} />

          {/* ── Named registry ────────────────────────────────────────────── */}
          <H2 id="named-registry">Named tour registry</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Register a tour by name so any component can start it — no prop drilling. Requires <IC>&lt;TourProvider&gt;</IC>.
          </p>
          <Code code={`// Register in your layout
useRegisterTour("onboarding", { id: "onboarding", persist: true, steps: [...] });

// Start from anywhere in the tree
function HelpButton() {
  const tour = useTourControls("onboarding");
  return <button onClick={() => tour?.start()}>Take the tour</button>;
}`} />

          {/* ── useTourSequence ───────────────────────────────────────────── */}
          <H2 id="tour-sequence">useTourSequence</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Chain named tours end-to-end. When one finishes the next starts automatically. Requires <IC>&lt;TourProvider&gt;</IC>.
          </p>
          <Code code={`useRegisterTour("setup",     setupConfig);
useRegisterTour("dashboard", dashboardConfig);

const { startSequence } = useTourSequence(["setup", "dashboard"]);
<button onClick={startSequence}>Start full onboarding</button>`} />

          {/* ── useTourHistory ────────────────────────────────────────────── */}
          <H2 id="tour-history">useTourHistory()</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Reads all stored tour records from localStorage. Useful for progress indicators.
          </p>
          <Code code={`const { records, clearAll } = useTourHistory();
const completed  = records.filter(r => r.completedAt);
const inProgress = records.filter(r => r.currentStep !== undefined);`} />

          {/* ── useTourAnalytics ──────────────────────────────────────────── */}
          <H2 id="tour-analytics">useTourAnalytics()</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Wraps <IC>useTour</IC> and aggregates step-timing data into a session summary.
          </p>
          <Code code={`const { controls, summary } = useTourAnalytics({
  steps: [...],
  onFinish: () => analytics.track("tour_complete", {
    completionRate: summary.completionRate,
    avgTimePerStep: summary.avgTimePerStep,
    dropOffStep:    summary.dropOffStep,
  }),
});`} />

          {/* ── TourBeacon ────────────────────────────────────────────────── */}
          <H2 id="tour-beacon">TourBeacon</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            A pulsing dot anchored to any element. Clicking starts the specified named tour. Requires <IC>&lt;TourProvider&gt;</IC>.
          </p>
          <Code code={`<TourBeacon
  target="#new-dashboard"
  tourId="feature-x"
  position="top-right"
/>`} />

          {/* ── TourChecklist ─────────────────────────────────────────────── */}
          <H2 id="tour-checklist">TourChecklist</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            A side-panel progress list. Steps with a <IC>section</IC> prop are grouped under headers. Clicking a step jumps to it.
          </p>
          <Code code={`<TourChecklist
  steps={steps}
  currentStep={currentStep}
  isActive={isActive}
  onJumpTo={moveTo}
  title="Getting started"
/>`} />

          {/* ── TourTooltip ───────────────────────────────────────────────── */}
          <H2 id="tour-tooltip">TourTooltip</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            A lightweight, non-intrusive tooltip — no overlay, no darkening. Shows on hover, click, or always.
          </p>
          <Code code={`<TourTooltip target="#help-icon" content="Click for a tour." trigger="hover" />

<TourTooltip
  target="#new-feature"
  title="✨ New!"
  content="Check out the redesigned dashboard."
  trigger="always"
  side="bottom"
  onDismiss={() => dismiss()}
/>`} />

          {/* ── TourProvider ──────────────────────────────────────────────── */}
          <H2 id="tour-provider">TourProvider</H2>
          <p className="mb-4 text-gray-700 dark:text-zinc-400">
            Optional. Wrap your app root when you have multiple tours or want named registry + <IC>useIsTourActive</IC>. Single-tour apps work fine without it.
          </p>
          <Code code={`<TourProvider>
  <App />
</TourProvider>

// Read active tour state from anywhere
const { activeTourId } = useTourContext() ?? {};`} />

          {/* ── Analytics hooks ───────────────────────────────────────────── */}
          <H2 id="analytics">Analytics hooks</H2>
          <PropTable rows={[
            { prop: "onStepEnter", type: "(index, { enteredAt, step }) => void", desc: "Fires when a step becomes fully visible (after animation). enteredAt is a Unix timestamp." },
            { prop: "onStepExit",  type: "(index, { duration, reason, step }) => void", desc: "Fires when the user leaves a step. reason is 'next' | 'prev' | 'skip' | 'close'." },
          ]} />
          <Code code={`useTour({
  steps,
  onStepEnter: (i, { step }) =>
    analytics.track("tour_step_view", { step: i, title: String(step.title) }),
  onStepExit: (i, { duration, reason }) =>
    analytics.track("tour_step_exit", { step: i, duration, reason }),
});`} />

          {/* ── Adapters ──────────────────────────────────────────────────── */}
          <H2 id="adapters">Analytics adapters</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Pre-wired configs for PostHog, Segment, Mixpanel, and Amplitude. Automatically tracks all tour events.
          </p>
          <Code code={`import { adapters } from "@oqlet/react-driver";
import posthog from "posthog-js";

useTour({ ...adapters.posthog(posthog, { tourId: "onboarding" }), steps: [...] });
// adapters.segment(analytics, meta)
// adapters.mixpanel(mixpanel, meta)
// adapters.amplitude(amplitude, meta)`} />

          {/* ── debug ─────────────────────────────────────────────────────── */}
          <H2 id="debug">debug mode</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Logs every step transition, duration, and reason to the console. Never set in production.
          </p>
          <Code code={`useTour({ debug: process.env.NODE_ENV === "development", steps: [...] });`} />

          {/* ── onError ───────────────────────────────────────────────────── */}
          <H2 id="on-error">onError</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Called on recoverable errors — <IC>stepsUrl</IC> fetch failures, <IC>waitForElement</IC> timeouts, and more.
          </p>
          <Code code={`useTour({
  onError: (err, context) => Sentry.captureException(err, { extra: { context } }),
  steps: [...],
});`} />

          {/* ── stepsUrl ──────────────────────────────────────────────────── */}
          <H2 id="steps-url">stepsUrl</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Fetch step config from an API at runtime. Marketing / product can update copy without a code deploy.
          </p>
          <Code code={`useTour({
  stepsUrl: "/api/tours/onboarding",
  stepsTransform: (data: any) => data.steps.map((s: any) => ({
    target: s.selector, title: s.heading, content: s.body,
  })),
});`} />

          {/* ── Locales ───────────────────────────────────────────────────── */}
          <H2 id="locales">Locales</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Pre-built locale configs for 13 languages. Available: <IC>en fr es de pt it nl ja zh ko ar ru hi</IC>.
          </p>
          <Code code={`import { locales } from "@oqlet/react-driver";

useTour({ ...locales.fr, steps: [...] });
// prevBtnText: "← Retour", nextBtnText: "Suivant →", doneBtnText: "Terminer"`} />

          {/* ── useStepRef ────────────────────────────────────────────────── */}
          <H2 id="step-ref">useStepRef(id)</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Refactor-safe element targeting. Safe to rename IDs and classes — the tour always finds the element via a stable <IC>data-tour-ref</IC> attribute.
          </p>
          <Code code={`const { ref, target } = useStepRef("save-btn");

<button ref={ref}>Save</button>

{ target, content: "Click here to save." }
// target = '[data-tour-ref="save-btn"]'`} />

          {/* ── waitForElement ────────────────────────────────────────────── */}
          <H2 id="wait-for-element">waitForElement</H2>
          <p className="mb-4 text-gray-700 dark:text-zinc-400">
            The utility the library uses internally — exported so you can use it in custom <IC>beforeNext</IC> callbacks.
          </p>
          <Code code={`import { waitForElement } from "@oqlet/react-driver";

beforeNext: async () => {
  await navigate("/dashboard");
  await waitForElement("#analytics-chart", 6000);
}`} />

          {/* ── Testing ───────────────────────────────────────────────────── */}
          <H2 id="testing">Testing utilities</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            Import from <IC>@oqlet/react-driver/testing</IC> to stub <IC>TourControls</IC> — no driver.js setup required.
          </p>
          <Code code={`import { createMockTour } from "@oqlet/react-driver/testing";
import { vi } from "vitest";

const mockTour = createMockTour({ isActive: true });
vi.mock("@oqlet/react-driver", () => ({ useTour: () => mockTour }));
expect(mockTour.start).toHaveBeenCalledWith(0);`} />

          {/* ── CDN / UMD ─────────────────────────────────────────────────── */}
          <H2 id="cdn">CDN / UMD</H2>
          <p className="mb-3 text-gray-700 dark:text-zinc-400">
            A minified UMD bundle is included for script-tag usage or CodePen / StackBlitz prototypes.
          </p>
          <Code lang="html" code={`<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.development.js"></script>
<script src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.development.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@oqlet/react-driver/dist/react-driver.umd.js"></script>
<script>
  const { useTour } = ReactDriver;
</script>`} />

          {/* ── Contributing ──────────────────────────────────────────────── */}
          <H2 id="contributing">Contributing</H2>
          <Code lang="bash" code={`git clone https://github.com/goutham-05/react-driver
cd react-driver
npm install
npm test          # vitest — 128 tests
npm run build     # tsup — ESM + CJS + UMD + .d.ts + driver.css
npm run test:e2e  # playwright — 31 E2E tests`} />
          <p className="text-sm text-gray-500 dark:text-zinc-400">
            Issues and pull requests are welcome. Please open an issue first for significant changes.
          </p>

          {/* ── Bottom navigation ─────────────────────────────────────────── */}
          <div className="mt-16 flex items-center justify-between border-t border-gray-100 pt-8 dark:border-zinc-800">
            {prevSection ? (
              <a href={`#${prevSection.id}`} className="group flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm no-underline transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/20">
                <svg className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:text-zinc-500 dark:group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Previous</div>
                  <div className="font-medium text-gray-700 dark:text-zinc-300">{prevSection.label}</div>
                </div>
              </a>
            ) : <span />}
            {nextSection ? (
              <a href={`#${nextSection.id}`} className="group flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 text-sm no-underline transition-all hover:border-blue-300 hover:bg-blue-50 dark:border-zinc-700 dark:hover:border-blue-700 dark:hover:bg-blue-950/20 text-right">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Next</div>
                  <div className="font-medium text-gray-700 dark:text-zinc-300">{nextSection.label}</div>
                </div>
                <svg className="h-4 w-4 text-gray-400 group-hover:text-blue-600 dark:text-zinc-500 dark:group-hover:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </a>
            ) : <span />}
          </div>
        </main>
      </div>
    </div>
  );
}
