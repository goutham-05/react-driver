import React, { useState } from "react";
import { useTour } from "@oqlet/react-driver";

// ── Shared code block ─────────────────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-xs text-zinc-500">tsx</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="rounded px-2 py-1 text-[11px] font-semibold text-zinc-400 hover:text-white">
          {copied ? "✓" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-4 text-xs leading-relaxed text-zinc-300"><code>{code}</code></pre>
    </div>
  );
}

// ── Demo 1: Basic tour ────────────────────────────────────────────────────────

function BasicTourDemo() {
  const { start, stop, isActive } = useTour({
    steps: [
      { target: "#basic-nav",  title: "Navigation",    content: "The tour can target any element on the page using a CSS selector." },
      { target: "#basic-save", title: "Save button",   content: "Each step highlights exactly the element you specify.", side: "bottom" },
      { target: "#basic-stats",title: "Stats section", content: "Steps are plain objects — no JSX, no refs required.", side: "top" },
      { title: "You're all set!", content: "Omit target for a floating centred popover — great for intros and outros." },
    ],
    showProgress: true,
  });

  return (
    <div className="space-y-5">
      <div id="basic-nav" className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
        <span className="text-sm font-medium text-gray-500">← Toolbar:</span>
        <button id="basic-save"  className="btn btn-secondary btn-sm">💾 Save</button>
        <button id="basic-share" className="btn btn-secondary btn-sm">🔗 Share</button>
        <button id="basic-export" className="btn btn-secondary btn-sm">📤 Export</button>
      </div>
      <div id="basic-stats" className="grid grid-cols-3 gap-3">
        {[["1,284","Users"],["$48k","Revenue"],["+12%","Growth"]].map(([v,l]) => (
          <div key={l} className="stat-box"><div className="val">{v}</div><div className="lbl">{l}</div></div>
        ))}
      </div>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={() => start()}>▶ Start tour</button>
        <button className="btn btn-secondary btn-sm" onClick={() => start(2)}>Jump to step 3</button>
        {isActive && <button className="btn btn-danger btn-sm" onClick={stop}>✕ Stop</button>}
      </div>
    </div>
  );
}

// ── Demo 2: Programmatic control ──────────────────────────────────────────────

function ProgrammaticDemo() {
  const { start, stop, next, prev, moveTo, isActive, currentStep } = useTour({
    steps: [
      { target: "#ctrl-a", title: "Step 1 of 4", content: "Use the buttons below to drive the tour from your own UI.", side: "bottom" },
      { target: "#ctrl-b", title: "Step 2 of 4", content: "next() and prev() advance or retreat one step at a time.",  side: "bottom" },
      { target: "#ctrl-c", title: "Step 3 of 4", content: "moveTo(index) jumps directly to any step by index.",       side: "bottom" },
      { target: "#ctrl-d", title: "Step 4 of 4", content: "stop() destroys the tour immediately from anywhere.",      side: "bottom" },
    ],
  });

  return (
    <div className="space-y-4">
      {/* Controls are placed ABOVE the target toolbar so driver.js popovers
          (side:"bottom") never overlap the buttons. */}
      <div className="flex flex-wrap gap-2">
        {!isActive ? (
          <button className="btn btn-primary" onClick={() => start()}>▶ Start</button>
        ) : (
          <>
            <button className="btn btn-secondary btn-sm" onClick={prev}>← prev()</button>
            <button className="btn btn-secondary btn-sm" onClick={next}>next() →</button>
            <button className="btn btn-secondary btn-sm" onClick={() => moveTo(0)}>moveTo(0)</button>
            <button className="btn btn-danger btn-sm"    onClick={stop}>stop()</button>
          </>
        )}
      </div>
      {isActive && (
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
          <span className="h-2 w-2 rounded-full bg-green-500" />
          Active — step {currentStep + 1} of 4
        </div>
      )}
      <div className="mock-toolbar">
        {["a","b","c","d"].map(l => (
          <button key={l} id={`ctrl-${l}`} className="btn btn-secondary btn-sm">{l.toUpperCase()}</button>
        ))}
      </div>
    </div>
  );
}

// ── Demo 3: Custom styling ────────────────────────────────────────────────────

function CustomStylingDemo() {
  const { start } = useTour({
    steps: [
      { target: "#badge-new",  title: "✨ New feature",   content: "Pass popoverClass to theme individual steps or the whole tour.",  side: "bottom" },
      { target: "#badge-beta", title: "🧪 Beta",          content: "overlayOpacity controls how dark the background overlay is.",     side: "bottom" },
      { target: "#badge-soon", title: "🚀 Coming soon",   content: "Custom button labels: prevBtnText, nextBtnText, doneBtnText.",    side: "bottom" },
    ],
    overlayOpacity: 0.5,
    prevBtnText: "← Prev",
    nextBtnText: "Next →",
    doneBtnText: "✓ Got it",
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <span id="badge-new"  className="badge badge-blue">✨ New</span>
        <span id="badge-beta" className="badge badge-orange">🧪 Beta</span>
        <span id="badge-soon" className="badge badge-green">🚀 Soon</span>
      </div>
      <p className="text-sm text-gray-500 dark:text-zinc-400">overlayOpacity: 0.5, custom button labels</p>
      <button className="btn btn-primary" onClick={() => start()}>▶ Start styled tour</button>
    </div>
  );
}

// ── Tab structure ─────────────────────────────────────────────────────────────

const BASIC_CODE = `const { start, stop, isActive } = useTour({
  steps: [
    { target: "#nav",    title: "Navigation",  content: "Target any element with a CSS selector." },
    { target: "#save",   title: "Save",        content: "Each step highlights exactly one element.", side: "bottom" },
    { target: "#stats",  title: "Stats",       content: "Steps are plain data — no JSX required.",  side: "top"   },
    {                    title: "You're set!",  content: "No target = floating centred popover."     },
  ],
  showProgress: true,
});`;

const PROGRAMMATIC_CODE = `const { start, stop, next, prev, moveTo, isActive, currentStep } = useTour({
  steps: [ /* ... */ ],
});

// Drive the tour from your own UI — bypass the built-in buttons
<button onClick={prev}>← Back</button>
<button onClick={next}>Next →</button>
<button onClick={() => moveTo(2)}>Jump to step 3</button>
<button onClick={stop}>End tour</button>`;

const STYLING_CODE = `useTour({
  steps: [
    { target: "#badge-new",  content: "...", popoverClass: "my-popover" },
    { target: "#badge-beta", content: "..." },
  ],
  overlayOpacity: 0.5,           // lighter overlay
  popoverClass: "my-popover",    // theme all popovers
  prevBtnText: "← Prev",
  nextBtnText: "Next →",
  doneBtnText: "✓ Got it",
});`;

const CROSS_ROUTE_CODE = `// Mount useTour outside <Routes> so it persists across navigation.
function Layout() {
  const navigate = useNavigate();

  const { start } = useTour({
    steps: [
      { target: "#product",     content: "Browse products." },
      { target: "#add-to-cart", content: "Add to cart.",
        beforeNext: () => navigate("/cart"),
        afterNext:  () => setOpen(false) },
      { target: "#cart-item",   content: "Your item." },
      { target: "#checkout",    content: "Proceed.",
        beforeNext: () => navigate("/checkout") },
      { target: "#pay",         content: "Place your order." },
    ],
    waitForTarget: 4000,
  });

  return (
    <>
      <button onClick={() => start()}>Start shopping tour</button>
      <Routes>...</Routes>
    </>
  );
}`;

const ACTION_CODE = `useTour({
  steps: [
    // The library highlights the exact item, owns the click via advanceOn,
    // and calls beforeNext — whether the user clicks the item or Next.
    {
      target: "#menu-edit-profile",
      title: "Edit profile",
      content: "Click it or press Next to continue.",
      advanceOn: "#menu-edit-profile",            // element click = pressing Next
      beforeNext: () => setActivePanel("profile"), // open panel (dropdown stays mounted)
      afterNext:  () => setMenuOpen(false),        // cleanup — fires after animation
    },
    {
      target: "#panel-profile",
      title: "Profile settings",
      content: "Your details in one place.",
      beforeNext: () => setMenuOpen(true),         // reopen menu for next item
      afterNext:  () => setActivePanel(null),
    },
  ],
});`;

// ── Demo 4: JSX content ───────────────────────────────────────────────────────

function JSXContentDemo() {
  const { start } = useTour({
    steps: [
      {
        target: "#jsx-badge",
        title: <span style={{ color: "#3b82f6", fontWeight: 700 }}>✨ Rich content</span>,
        content: (
          <div>
            <p style={{ marginBottom: 8 }}>
              <code>title</code> and <code>content</code> accept any React node —
              styled text, images, or interactive elements.
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["React", "JSX", "Images", "Video"].map(t => (
                <span key={t} style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 999, padding: "2px 10px", fontSize: 12, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>
        ),
        side: "bottom",
      },
      {
        target: "#jsx-stats",
        title: "📊 Live data",
        content: (
          <div>
            <p style={{ marginBottom: 6 }}>Popovers can contain charts, tables, or any UI.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6 }}>
              {[["98%", "Uptime"], ["1.2k", "Users"], ["+24%", "Growth"]].map(([v, l]) => (
                <div key={l} style={{ background: "#f8fafc", borderRadius: 8, padding: "8px 4px", textAlign: "center" }}>
                  <div style={{ fontWeight: 800 }}>{v}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        ),
        side: "top",
      },
    ],
    showProgress: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <span id="jsx-badge" className="badge badge-blue" style={{ fontSize: "0.85rem", padding: "6px 14px" }}>React component</span>
      </div>
      <div id="jsx-stats" className="mock-stats">
        {[["98%","Uptime"],["1.2k","Users"],["+24%","Growth"]].map(([v,l]) => (
          <div key={l} className="stat-box"><div className="val">{v}</div><div className="lbl">{l}</div></div>
        ))}
      </div>
      <button className="btn btn-primary" onClick={() => start()}>▶ Start JSX tour</button>
    </div>
  );
}

// ── Demo 5: Conditional steps ─────────────────────────────────────────────────

function ConditionalDemo() {
  const [plan, setPlan] = React.useState<"free" | "pro">("free");
  const { start, totalSteps } = useTour({
    steps: [
      { target: "#cond-dashboard", title: "Dashboard",   content: "Your main workspace.", side: "bottom" },
      { target: "#cond-upgrade",   title: "Upgrade",     content: "Unlock unlimited projects with Pro.", side: "top",
        visibleWhen: () => plan === "free" },
      { target: "#cond-pro-only",  title: "Pro feature", content: "This step only appears for Pro users.", side: "top",
        visibleWhen: () => plan === "pro" },
      { target: "#cond-settings",  title: "Settings",    content: "Adjust your preferences.", side: "top" },
    ],
    showProgress: true,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-600 dark:text-zinc-400">Simulated plan:</span>
        {(["free","pro"] as const).map(p => (
          <button key={p} onClick={() => setPlan(p)}
            className={`btn btn-sm ${plan === p ? "btn-primary" : "btn-secondary"}`}>
            {p === "free" ? "🆓 Free" : "⭐ Pro"}
          </button>
        ))}
      </div>
      <div id="cond-dashboard" className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-800/50">Dashboard</div>
      <div id="cond-upgrade"   className={`rounded-xl border p-3 text-sm ${plan === "free" ? "border-amber-200 bg-amber-50 text-amber-800" : "border-gray-200 bg-gray-50 text-gray-400 line-through dark:border-zinc-700 dark:bg-zinc-800/50"}`}>
        Upgrade banner {plan === "pro" && "(hidden — Pro user)"}
      </div>
      <div id="cond-pro-only"  className={`rounded-xl border p-3 text-sm ${plan === "pro" ? "border-purple-200 bg-purple-50 text-purple-800" : "border-gray-200 bg-gray-50 text-gray-400 line-through dark:border-zinc-700 dark:bg-zinc-800/50"}`}>
        Pro-only feature {plan === "free" && "(hidden — Free user)"}
      </div>
      <div id="cond-settings"  className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800/50">Settings</div>
      <div className="flex items-center gap-3">
        <button className="btn btn-primary" onClick={() => start()}>▶ Start tour</button>
        <span className="text-sm text-gray-500 dark:text-zinc-400">{totalSteps} visible steps for {plan} plan</span>
      </div>
    </div>
  );
}

type Tab = "basic" | "programmatic" | "styling" | "jsx-content" | "conditional" | "cross-route" | "action";

const tabs: { id: Tab; label: string; desc: string }[] = [
  { id: "basic",         label: "Basic",             desc: "CSS selectors, floating popovers, showProgress" },
  { id: "programmatic",  label: "Programmatic",      desc: "Drive with next(), prev(), moveTo(), stop()" },
  { id: "styling",       label: "Custom styling",     desc: "overlayOpacity, popoverClass, button labels" },
  { id: "jsx-content",   label: "JSX content",        desc: "React nodes in title & content — images, buttons, styled text" },
  { id: "conditional",   label: "Conditional steps",  desc: "visibleWhen filters steps based on runtime state" },
  { id: "cross-route",   label: "Cross-route",        desc: "Tours that navigate between React Router pages" },
  { id: "action",        label: "Action-driven",      desc: "advanceOn, beforeNext, afterNext" },
];

const JSX_CODE = `useTour({
  steps: [
    {
      target: "#badge",
      title: <span style={{ color: "#3b82f6" }}>✨ Rich content</span>,
      content: (
        <div>
          <p>title and content accept any React node.</p>
          <img src="/preview.png" alt="preview" />
        </div>
      ),
    },
  ],
});`;

const CONDITIONAL_CODE = `const { start, totalSteps } = useTour({
  steps: [
    { target: "#dashboard", content: "Your workspace." },

    // Only shown to free-plan users
    { target: "#upgrade",
      content: "Unlock Pro features.",
      visibleWhen: () => user.plan === "free" },

    // Only shown when feature flag is on
    { target: "#new-feature",
      content: "Try the new editor!",
      visibleWhen: () => flags.newEditor },

    { target: "#settings", content: "Your preferences." },
  ],
});

// totalSteps reflects only visible steps after filtering
<span>{currentStep + 1} / {totalSteps}</span>`;

const demos: Record<Tab, { component: React.ReactNode; code: string }> = {
  basic:        { component: <BasicTourDemo />,     code: BASIC_CODE        },
  programmatic: { component: <ProgrammaticDemo />,  code: PROGRAMMATIC_CODE },
  styling:      { component: <CustomStylingDemo />, code: STYLING_CODE      },
  "jsx-content":{ component: <JSXContentDemo />,    code: JSX_CODE          },
  conditional:  { component: <ConditionalDemo />,   code: CONDITIONAL_CODE  },
  "cross-route":{ component: <CrossRouteNote />,    code: CROSS_ROUTE_CODE  },
  action:       { component: <ActionNote />,        code: ACTION_CODE       },
};

function CrossRouteNote() {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800/50 dark:bg-blue-950/20">
      <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
        🗺️ Cross-route demo requires a full app with React Router pages.
      </p>
      <p className="text-sm text-blue-700 dark:text-blue-400">
        The shopping tour demo (Products → Cart → Checkout) is built into this website.
        Open it at <code className="font-mono">/examples/shopping</code> to experience it live,
        or see the code snippet above.
      </p>
      <a href="/examples/shopping" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 no-underline hover:underline dark:text-blue-400">
        Open shopping tour demo →
      </a>
    </div>
  );
}

function ActionNote() {
  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-800/50 dark:bg-purple-950/20">
      <p className="text-sm font-medium text-purple-900 dark:text-purple-300 mb-2">
        🖱️ The action-driven auth tour is a full multi-step demo.
      </p>
      <p className="text-sm text-purple-700 dark:text-purple-400">
        It walks through signup → profile menu → Edit profile panel → Notifications panel,
        with both element clicks and Next button advancing the tour identically.
      </p>
      <a href="/examples/auth" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-purple-700 no-underline hover:underline dark:text-purple-400">
        Open auth tour demo →
      </a>
    </div>
  );
}

export default function ExamplesPage() {
  const [active, setActive] = useState<Tab>("basic");
  const demo = demos[active];

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="mb-2 text-4xl font-black">Examples</h1>
      <p className="mb-10 text-lg text-gray-500 dark:text-zinc-400">
        Live demos with copy-pasteable code. All examples use the local source — changes in the library are reflected immediately.
      </p>

      {/* Tab bar */}
      <div className="mb-6 flex flex-wrap gap-2">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className={[
              "rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
              active === t.id
                ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300"
                : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800",
            ].join(" ")}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Description */}
      <p className="mb-6 text-sm text-gray-500 dark:text-zinc-400">
        {tabs.find(t => t.id === active)?.desc}
      </p>

      {/* Demo + code side by side */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Live demo</div>
          {demo.component}
        </div>
        <div>
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Code</div>
          <CodeBlock code={demo.code} />
        </div>
      </div>
    </div>
  );
}
