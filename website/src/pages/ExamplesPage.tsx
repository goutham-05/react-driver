import React, { useState, useRef, useEffect } from "react";
import {
  useTour, TourTooltip, TourChecklist,
  useTourAnalytics, locales, clearTourHistory,
} from "@oqlet/react-driver";

// ── Code block ────────────────────────────────────────────────────────────────

function CodeBlock({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#0d1117]">
      <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2">
        <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-zinc-500">tsx</span>
        <button onClick={() => { navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
          className="rounded px-2 py-1 text-[11px] font-semibold text-zinc-500 hover:text-zinc-200 transition-colors">
          {copied ? "✓ Copied" : "Copy"}
        </button>
      </div>
      <pre className="overflow-x-auto p-5 text-[12.5px] leading-relaxed text-zinc-300"><code>{code}</code></pre>
    </div>
  );
}

// ── Demo wrapper ──────────────────────────────────────────────────────────────

function DemoPane({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-zinc-500">
        Live demo
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Demos
// ─────────────────────────────────────────────────────────────────────────────

function BasicTourDemo() {
  const { start, stop, isActive } = useTour({
    steps: [
      { target: "#basic-nav",   title: "Navigation",    content: "Target any element on the page using a CSS selector."       },
      { target: "#basic-save",  title: "Save button",   content: "Each step highlights exactly one element.", side: "bottom"  },
      { target: "#basic-stats", title: "Stats section", content: "Steps are plain data — no JSX, no refs required.", side: "top" },
      { title: "You're all set!", content: "No target = floating centred popover — great for intros and outros."               },
    ],
    showProgress: true,
  });
  return (
    <div className="space-y-5">
      <div id="basic-nav" className="flex flex-wrap items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
        <span className="text-sm font-medium text-gray-400">Toolbar:</span>
        <button id="basic-save"   className="btn btn-secondary btn-sm">💾 Save</button>
        <button id="basic-share"  className="btn btn-secondary btn-sm">🔗 Share</button>
        <button id="basic-export" className="btn btn-secondary btn-sm">📤 Export</button>
      </div>
      <div id="basic-stats" className="grid grid-cols-3 gap-3">
        {[["1,284","Users"],["$48k","Revenue"],["+12%","Growth"]].map(([v,l]) => (
          <div key={l} className="stat-box"><div className="val">{v}</div><div className="lbl">{l}</div></div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <button className="btn btn-primary" onClick={() => start()}>▶ Start tour</button>
        <button className="btn btn-secondary btn-sm" onClick={() => start(2)}>Jump to step 3</button>
        {isActive && <button className="btn btn-danger btn-sm" onClick={stop}>✕ Stop</button>}
      </div>
    </div>
  );
}

function ProgrammaticDemo() {
  const { start, stop, next, prev, moveTo, isActive, currentStep } = useTour({
    steps: [
      { target: "#ctrl-a", title: "Step 1 of 4", content: "Drive the tour from your own UI — bypass the built-in buttons.", side: "bottom" },
      { target: "#ctrl-b", title: "Step 2 of 4", content: "next() and prev() advance or retreat one step at a time.",  side: "bottom" },
      { target: "#ctrl-c", title: "Step 3 of 4", content: "moveTo(index) jumps directly to any step by index.",       side: "bottom" },
      { target: "#ctrl-d", title: "Step 4 of 4", content: "stop() destroys the tour immediately from anywhere.",      side: "bottom" },
    ],
  });
  return (
    <div className="space-y-4">
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
      {isActive && <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400"><span className="h-2 w-2 rounded-full bg-green-500" />Step {currentStep + 1} of 4</div>}
      <div className="mock-toolbar">
        {["a","b","c","d"].map(l => <button key={l} id={`ctrl-${l}`} className="btn btn-secondary btn-sm">{l.toUpperCase()}</button>)}
      </div>
    </div>
  );
}

function StylingDemo() {
  const { start } = useTour({
    steps: [
      { target: "#s-new",  title: "✨ New",  content: "Pass popoverClass to theme individual steps.", side: "bottom" },
      { target: "#s-beta", title: "🧪 Beta", content: "overlayOpacity controls the overlay darkness.", side: "bottom" },
      { target: "#s-soon", title: "🚀 Soon", content: "Custom button labels with prevBtnText, nextBtnText, doneBtnText.", side: "bottom" },
    ],
    overlayOpacity: 0.4,
    prevBtnText: "← Prev",
    nextBtnText: "Next →",
    doneBtnText: "✓ Got it",
  });
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <span id="s-new"  className="badge badge-blue">✨ New</span>
        <span id="s-beta" className="badge badge-orange">🧪 Beta</span>
        <span id="s-soon" className="badge badge-green">🚀 Soon</span>
      </div>
      <p className="text-sm text-gray-500 dark:text-zinc-400">overlayOpacity: 0.4 · custom button labels</p>
      <button className="btn btn-primary" onClick={() => start()}>▶ Start styled tour</button>
    </div>
  );
}

function JSXContentDemo() {
  const { start } = useTour({
    steps: [
      {
        target: "#jsx-hero",
        title: (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 20 }}>🎉</span>
            <span style={{ color: "#2563eb", fontWeight: 800 }}>
              Styled title
            </span>
          </div>
        ),
        content: (
          <div>
            <p style={{ marginBottom: 10, lineHeight: 1.6 }}>
              Both <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>title</code> and{" "}
              <code style={{ background: "#f1f5f9", padding: "1px 5px", borderRadius: 4, fontSize: 12 }}>content</code>{" "}
              accept any <strong>React node</strong> — gradients, components, anything.
            </p>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {["React nodes","Styled text","Images","Video","Tables","Code"].map(t => (
                <span key={t} style={{ background: "#eff6ff", color: "#1d4ed8", borderRadius: 999, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>
        ),
        side: "bottom",
      },
      {
        target: "#jsx-stats",
        title: "📊 Embed live data",
        content: (
          <div>
            <p style={{ marginBottom: 10, fontSize: 13, color: "#64748b" }}>Popovers can render charts, tables, or any UI component.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[["↑ 24%","Growth","#22c55e"],["1,284","Users","#3b82f6"],["$48k","Revenue","#8b5cf6"],["99.9%","Uptime","#f59e0b"]].map(([v, l, c]) => (
                <div key={l} style={{ background: "#f8fafc", borderRadius: 10, padding: "10px 12px", borderLeft: `3px solid ${c}` }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: "#0f172a" }}>{v}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        ),
        side: "top",
      },
      {
        target: "#jsx-code",
        title: (
          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ background: "#1e293b", color: "#38bdf8", fontFamily: "monospace", fontSize: 12, padding: "2px 8px", borderRadius: 6 }}>tsx</span>
            Code examples in popovers
          </span>
        ),
        content: (
          <div>
            <p style={{ marginBottom: 8, fontSize: 13, color: "#64748b" }}>Render formatted code inline:</p>
            <pre style={{ background: "#0f172a", color: "#e2e8f0", borderRadius: 8, padding: "10px 12px", fontSize: 11, lineHeight: 1.7, margin: 0, overflow: "auto" }}>
              <code>{`{ target: "#el",
  title: <strong>Rich</strong>,
  content: <MyChart />,
}`}</code>
            </pre>
          </div>
        ),
        side: "bottom",
      },
    ],
    showProgress: true,
  });

  return (
    <div className="space-y-4">
      {/* Three distinct target elements */}
      <div id="jsx-hero" className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-800/50 dark:bg-blue-950/20">
        <div className="text-sm font-semibold text-blue-900 dark:text-blue-200">Step 1 — styled title &amp; pill tags</div>
        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">Click ▶ to see a gradient title and tag cloud</div>
      </div>
      <div id="jsx-stats" className="grid grid-cols-4 gap-2">
        {[["↑ 24%","Growth"],["1,284","Users"],["$48k","Revenue"],["99.9%","Uptime"]].map(([v,l]) => (
          <div key={l} className="rounded-lg border border-gray-200 bg-gray-50 p-2 text-center dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="text-sm font-bold">{v}</div>
            <div className="text-[10px] text-gray-500">{l}</div>
          </div>
        ))}
      </div>
      <div id="jsx-code" className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 font-mono text-xs text-gray-600 dark:border-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-400">
        {"{ title: <ReactNode />, content: <AnyComponent /> }"}
      </div>
      <button className="btn btn-primary" onClick={() => start()}>▶ Start JSX tour (3 steps)</button>
    </div>
  );
}

function SpotlightDemo() {
  const { start } = useTour({
    steps: [
      // content is required by TourStep but not rendered when popoverless: true —
      // it's still good practice to describe the step for accessibility / future use.
      { target: "#spot-a", content: "Element A spotlight", popoverless: true  },
      { target: "#spot-b", content: "Regular step for comparison.", side: "bottom" },
      { target: "#spot-c", content: "Element C spotlight", popoverless: true  },
    ],
    showProgress: true,
  });
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div id="spot-a" className="badge badge-blue">Element A</div>
        <div id="spot-b" className="badge badge-orange">Element B</div>
        <div id="spot-c" className="badge badge-green">Element C</div>
      </div>
      <p className="text-sm text-gray-500 dark:text-zinc-400">Steps 1 and 3 use <code>popoverless: true</code> — pure visual spotlight, no popover shown.</p>
      <button className="btn btn-primary" onClick={() => start()}>▶ Start spotlight tour</button>
    </div>
  );
}

function CustomPopoverDemo() {
  const { start, isActive, stop } = useTour({
    renderPopover: ({ step, next, stop: s, isLast, stepIndex, totalSteps }) => (
      <div style={{ background: "#1e293b", border: "1px solid #334155", borderRadius: 16, padding: 20, maxWidth: 280, boxShadow: "0 20px 60px rgba(0,0,0,0.5)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <span style={{ background: "#3b82f6", color: "#fff", borderRadius: 999, padding: "2px 10px", fontSize: 11, fontWeight: 700 }}>
            {stepIndex + 1} / {totalSteps}
          </span>
          <button onClick={s} style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", fontSize: 18, lineHeight: 1 }}>×</button>
        </div>
        {step.title && <div style={{ fontWeight: 700, color: "#f1f5f9", marginBottom: 6, fontSize: 15 }}>{step.title}</div>}
        <div style={{ color: "#94a3b8", fontSize: 13, lineHeight: 1.6 }}>{step.content}</div>
        <button onClick={next} style={{ marginTop: 16, width: "100%", background: "#3b82f6", color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>
          {isLast ? "✓ Done" : "Continue →"}
        </button>
      </div>
    ),
    steps: [
      { target: "#cp-a", title: "Step 1", content: "This popover is 100% custom React — no driver.js default styles.", side: "bottom" },
      { target: "#cp-b", title: "Step 2", content: "Integrate with any design system by passing renderPopover.", side: "bottom" },
    ],
  });
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <button id="cp-a" className="btn btn-secondary">Button A</button>
        <button id="cp-b" className="btn btn-secondary">Button B</button>
      </div>
      <button className="btn btn-primary" onClick={() => start()}>▶ Custom popover tour</button>
    </div>
  );
}

function ConditionalDemo() {
  const [plan, setPlan] = React.useState<"free" | "pro">("free");

  // Define steps outside useTour so we can pre-compute visible count for display
  // before the tour starts (totalSteps from useTour is 0 until start() is called).
  const steps = [
    { target: "#cond-dash", title: "Dashboard",   content: "Your main workspace.", side: "bottom" as const },
    { target: "#cond-up",   title: "Upgrade",     content: "Unlock unlimited projects.", side: "top" as const,
      visibleWhen: () => plan === "free" },
    { target: "#cond-pro",  title: "Pro feature", content: "Only visible to Pro users.", side: "top" as const,
      visibleWhen: () => plan === "pro" },
    { target: "#cond-set",  title: "Settings",    content: "Adjust your preferences.", side: "top" as const },
  ];

  const visibleCount = steps.filter(s => !s.visibleWhen || s.visibleWhen()).length;
  const { start, totalSteps } = useTour({ steps, showProgress: true });
  // Use the live totalSteps when the tour is running, pre-computed count otherwise.
  const displayCount = totalSteps > 0 ? totalSteps : visibleCount;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">Plan:</span>
        {(["free","pro"] as const).map(p => (
          <button key={p} onClick={() => setPlan(p)} className={`btn btn-sm ${plan === p ? "btn-primary" : "btn-secondary"}`}>
            {p === "free" ? "🆓 Free" : "⭐ Pro"}
          </button>
        ))}
      </div>
      {[
        ["cond-dash","Dashboard",""],
        ["cond-up",  plan === "free" ? "Upgrade banner (visible)" : "Upgrade banner (hidden)", plan === "pro" ? "line-through opacity-40" : ""],
        ["cond-pro", plan === "pro" ? "Pro feature (visible)" : "Pro feature (hidden)", plan === "free" ? "line-through opacity-40" : ""],
        ["cond-set", "Settings", ""],
      ].map(([id, label, extra]) => (
        <div key={id} id={id} className={`rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm dark:border-zinc-700 dark:bg-zinc-800/50 ${extra}`}>{label}</div>
      ))}
      <div className="flex items-center gap-3">
        <button className="btn btn-primary" onClick={() => start()}>▶ Start tour</button>
        <span className="text-sm text-gray-500">{displayCount} visible steps for {plan} plan</span>
      </div>
    </div>
  );
}

function CanAdvanceDemo() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { start, isActive } = useTour({
    steps: [
      {
        target: "#ca-name",
        title: "Your name",
        content: "Type your name to unlock Next.",
        side: "bottom",
        canAdvance: () => name.trim().length > 0,
      },
      {
        target: "#ca-email",
        title: "Your email",
        content: "Enter a valid email to continue.",
        side: "bottom",
        canAdvance: () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
      },
      { title: "All done!", content: "canAdvance validated both fields before advancing." },
    ],
  });
  return (
    <div className="space-y-4">
      <div className="field-group">
        <label className="field-label">Name</label>
        <input id="ca-name" className="form-input full" placeholder="Jane Smith" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div className="field-group">
        <label className="field-label">Email</label>
        <input id="ca-email" className="form-input full" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} />
      </div>
      <p className="text-sm text-gray-500 dark:text-zinc-400">Next is gated on <code>canAdvance</code> — try clicking it with an empty field.</p>
      <button className="btn btn-primary" onClick={() => start()}>▶ Start guided form</button>
    </div>
  );
}

function AutoAdvanceDemo() {
  const { start, isActive, stop } = useTour({
    steps: [
      { target: "#aa-a", title: "Slide 1",  content: "Advances automatically after 2 seconds.",  autoAdvanceAfter: 2000, side: "bottom" },
      { target: "#aa-b", title: "Slide 2",  content: "Counting down…",                           autoAdvanceAfter: 2000, side: "bottom" },
      { target: "#aa-c", title: "Slide 3",  content: "Great for demos, kiosk displays, or video walkthroughs.", autoAdvanceAfter: 2000, side: "bottom" },
      { title: "Done!", content: "The tour can also be driven manually at any time — autoAdvanceAfter is just a default." },
    ],
  });
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {["aa-a","aa-b","aa-c"].map((id, i) => (
          <div key={id} id={id} className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center text-sm font-medium dark:border-zinc-700 dark:bg-zinc-800/50">
            Slide {i+1}
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-500 dark:text-zinc-400">Each step advances after <strong>2 seconds</strong>. Click Next manually to skip ahead.</p>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={() => start()}>▶ Start auto-tour</button>
        {isActive && <button className="btn btn-danger btn-sm" onClick={stop}>✕ Stop</button>}
      </div>
    </div>
  );
}

function RestartDemo() {
  const [count, setCount] = useState(0);
  const { start, restart, stop, isActive } = useTour({
    steps: [
      { target: "#rst-a", title: "Welcome",  content: "This is step 1 of 3.",  side: "bottom" },
      { target: "#rst-b", title: "Middle",   content: "This is step 2 of 3.",  side: "bottom" },
      { target: "#rst-c", title: "The end",  content: "Tour completed! Try restart() to go again.", side: "bottom" },
    ],
    onStart:   () => setCount(c => c + 1),
  });
  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        {["rst-a","rst-b","rst-c"].map((id, i) => (
          <div key={id} id={id} className="badge badge-blue">Step {i+1}</div>
        ))}
      </div>
      {count > 0 && <p className="text-sm text-gray-500 dark:text-zinc-400">Started <strong>{count}×</strong> — restart() never fires onSkip or onFinish.</p>}
      <div className="flex flex-wrap gap-2">
        {!isActive ? (
          <button className="btn btn-primary" onClick={() => start()}>▶ Start</button>
        ) : (
          <>
            <button className="btn btn-secondary" onClick={restart}>↺ Restart from step 1</button>
            <button className="btn btn-danger btn-sm" onClick={stop}>✕ Stop</button>
          </>
        )}
      </div>
    </div>
  );
}

function TooltipDemo() {
  const [dismissed, setDismissed] = useState(false);
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-500 dark:text-zinc-400">Hover or click the elements below. No overlay, no darkening.</p>
      <div className="flex flex-wrap gap-6 items-center">
        <div className="flex items-center gap-2">
          <button id="tip-hover" className="btn btn-secondary">Hover me</button>
          <TourTooltip target="#tip-hover" content="This appears on hover." trigger="hover" side="right" />
        </div>
        <div className="flex items-center gap-2">
          <button id="tip-click" className="btn btn-secondary">Click me</button>
          <TourTooltip target="#tip-click" content="Toggles on click." trigger="click" side="right" />
        </div>
        {!dismissed && (
          <div className="flex items-center gap-2">
            <span id="tip-always" className="badge badge-blue">✨ New feature</span>
            <TourTooltip
              target="#tip-always"
              title="What's new"
              content="Persistent hint with a dismiss button."
              trigger="always"
              side="bottom"
              onDismiss={() => setDismissed(true)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function ChecklistDemo() {
  // IDs are defined alongside targets so there's no string manipulation needed.
  const items = [
    { id: "cl-profile", title: "Complete profile",    content: "Add your name and avatar."      },
    { id: "cl-team",    title: "Invite your team",    content: "Add collaborators."              },
    { id: "cl-connect", title: "Connect an account",  content: "Link your third-party apps."    },
    { id: "cl-export",  title: "Export first report", content: "Download your data."            },
  ];
  const steps = items.map(({ id, title, content }) => ({ target: `#${id}`, title, content }));
  const { start, stop, moveTo, currentStep, isActive } = useTour({ steps, showProgress: true });
  return (
    <div className="grid grid-cols-2 gap-4 items-start">
      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} id={item.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm font-medium dark:border-zinc-700 dark:bg-zinc-800/50">
            {item.title}
          </div>
        ))}
        <div className="flex gap-2 pt-1">
          {!isActive ? (
            <button className="btn btn-primary btn-sm" onClick={() => start()}>▶ Start tour</button>
          ) : (
            <button className="btn btn-danger btn-sm" onClick={stop}>✕ Stop</button>
          )}
        </div>
      </div>
      <TourChecklist steps={steps} currentStep={currentStep} isActive={isActive} onJumpTo={moveTo} title="Getting started" />
    </div>
  );
}

function PersistDemo() {
  const KEY = "example-persist-tour";
  const [shown, setShown] = useState(0);
  const { start, isActive } = useTour({
    id: KEY,
    showCount: 3,
    steps: [
      { title: "Persistence demo",  content: "This tour shows at most 3 times then stops. Count is stored in localStorage." },
      { target: "#persist-counter", content: "The counter below tracks how many times this tour has been shown.", side: "bottom" },
    ],
    onStart: () => setShown(n => n + 1),
  });
  const clear = () => {
    clearTourHistory(KEY); // library API — no internal key format needed
    setShown(0);
  };
  return (
    <div className="space-y-4">
      <div id="persist-counter" className="inline-flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/50">
        <span className="text-3xl font-black text-gray-900 dark:text-white">{shown}</span>
        <div className="text-sm text-gray-500 dark:text-zinc-400">
          <div className="font-semibold text-gray-700 dark:text-zinc-300">Times shown this session</div>
          <div>Tour stops after 3 (showCount: 3)</div>
        </div>
      </div>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={() => start()}>▶ Show tour</button>
        <button className="btn btn-secondary btn-sm" onClick={clear}>↺ Reset count</button>
      </div>
    </div>
  );
}

function AnalyticsDemo() {
  const { controls, summary } = useTourAnalytics({
    steps: [
      { target: "#an-a", title: "Step 1", content: "Spend some time on each step then navigate.", side: "bottom" },
      { target: "#an-b", title: "Step 2", content: "onStepExit records how long you stayed.", side: "bottom" },
      { target: "#an-c", title: "Step 3", content: "Complete or skip to see the summary.", side: "bottom" },
    ],
    onFinish: () => console.log("[analytics demo] finished", summary),
    onSkip:   () => console.log("[analytics demo] skipped",  summary),
  });
  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        {["an-a","an-b","an-c"].map((id, i) => (
          <div key={id} id={id} className="badge badge-blue">Step {i+1}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <button className="btn btn-primary" onClick={() => controls.start()}>▶ Start tour</button>
        {controls.isActive && <button className="btn btn-danger btn-sm" onClick={controls.stop}>✕ Skip</button>}
      </div>
      {summary.startCount > 0 && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50 space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-zinc-500">Analytics summary</div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500 dark:text-zinc-400">Started:</span> <strong>{summary.startCount}×</strong></div>
            <div><span className="text-gray-500 dark:text-zinc-400">Completed:</span> <strong>{summary.completed ? "Yes" : "No"}</strong></div>
            <div><span className="text-gray-500 dark:text-zinc-400">Completion rate:</span> <strong>{Math.round(summary.completionRate * 100)}%</strong></div>
            <div><span className="text-gray-500 dark:text-zinc-400">Avg time/step:</span> <strong>{summary.avgTimePerStep}ms</strong></div>
            {summary.dropOffStep !== null && (
              <div className="col-span-2"><span className="text-gray-500 dark:text-zinc-400">Drop-off at step:</span> <strong>{summary.dropOffStep}</strong></div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function LocalesDemo() {
  const [locale, setLocale] = useState<keyof typeof locales>("en");
  const { start } = useTour({
    ...locales[locale],
    steps: [
      { target: "#loc-a", title: "Welcome", content: "Button labels are now in the selected language." },
      { target: "#loc-b", title: "Step 2",  content: "13 languages built-in, or pass your own strings." },
    ],
    showProgress: true,
  });
  const LANGS = ["en","fr","es","de","pt","ja","zh","ko","ar"] as const;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {LANGS.map(l => (
          <button key={l} onClick={() => setLocale(l)}
            className={`rounded-lg border px-3 py-1 text-xs font-semibold transition-colors ${locale === l ? "border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950/40 dark:text-blue-300" : "border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"}`}>
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="flex gap-3">
        <div id="loc-a" className="badge badge-blue">Element A</div>
        <div id="loc-b" className="badge badge-orange">Element B</div>
      </div>
      <div className="text-sm text-gray-500 dark:text-zinc-400">
        {locale}: prev="{locales[locale].prevBtnText}" · next="{locales[locale].nextBtnText}" · done="{locales[locale].doneBtnText}"
      </div>
      <button className="btn btn-primary" onClick={() => start()}>▶ Start tour ({locale.toUpperCase()})</button>
    </div>
  );
}

function CrossRouteNote() {
  return (
    <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 dark:border-blue-800/50 dark:bg-blue-950/20 space-y-2">
      <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">🗺️ This demo requires a full multi-page app.</p>
      <p className="text-sm text-blue-700 dark:text-blue-400">The shopping tour (Products → Cart → Checkout) walks 8 steps across 3 routes using <code>beforeNext: () =&gt; navigate()</code> and <code>afterNext</code> for cleanup.</p>
      <a href="/examples/shopping" className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-700 no-underline hover:underline dark:text-blue-400">Open shopping tour demo →</a>
    </div>
  );
}

function ActionNote() {
  return (
    <div className="rounded-xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-800/50 dark:bg-purple-950/20 space-y-2">
      <p className="text-sm font-semibold text-purple-900 dark:text-purple-300">🖱️ This demo requires a signup form and dropdown menu.</p>
      <p className="text-sm text-purple-700 dark:text-purple-400">The auth tour walks through signup → avatar → profile menu → panels using <code>advanceOn</code>, <code>beforeNext</code>, and <code>afterNext</code> to keep highlighted elements in the DOM during transitions.</p>
      <a href="/examples/auth" className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-700 no-underline hover:underline dark:text-purple-400">Open auth tour demo →</a>
    </div>
  );
}

// ── Navigation structure ──────────────────────────────────────────────────────

interface ExampleItem { id: string; label: string; desc: string; component: React.ReactNode; code: string }
interface ExampleGroup { title: string; items: ExampleItem[] }

const GROUPS: ExampleGroup[] = [
  {
    title: "Basics",
    items: [
      { id: "basic",         label: "Basic tour",         desc: "CSS selectors, floating popovers, showProgress",       component: <BasicTourDemo />,    code: `useTour({
  steps: [
    { target: "#nav",   title: "Navigation", content: "Target any element with a CSS selector." },
    { target: "#save",  title: "Save",       content: "Each step highlights one element.", side: "bottom" },
    {                   title: "All done!",  content: "No target = floating centred popover." },
  ],
  showProgress: true,
});` },
      { id: "programmatic",  label: "Programmatic",       desc: "next(), prev(), moveTo(), stop() from your own UI",    component: <ProgrammaticDemo />, code: `const { next, prev, moveTo, stop } = useTour({ steps });

<button onClick={prev}>← prev()</button>
<button onClick={next}>next() →</button>
<button onClick={() => moveTo(2)}>moveTo(2)</button>
<button onClick={stop}>stop()</button>` },
      { id: "restart",       label: "restart()",           desc: "Replay a tour from step 0 without onSkip/onFinish",    component: <RestartDemo />,      code: `const { start, restart, stop } = useTour({ steps, onStart: trackStart });

<button onClick={restart}>↺ Restart from step 1</button>` },
    ],
  },
  {
    title: "Content & display",
    items: [
      { id: "jsx",           label: "JSX content",        desc: "React nodes in title & content — styled text, stats, code blocks, any component",  component: <JSXContentDemo />,   code: `useTour({
  steps: [
    {
      target: "#hero",
      // Styled title using inline color
      title: (
        <span style={{ color: "#2563eb", fontWeight: 800 }}>
          Styled title
        </span>
      ),
      content: (
        <div>
          <p>Both title and content accept any React node.</p>
          <div style={{ display: "flex", gap: 5 }}>
            {["React","JSX","Images","Video"].map(t => (
              <span key={t} style={{ background: "#eff6ff", color: "#1d4ed8",
                                     borderRadius: 999, padding: "2px 8px", fontSize: 11 }}>{t}</span>
            ))}
          </div>
        </div>
      ),
    },
    {
      target: "#stats",
      title: "📊 Embed live data",
      // Render a mini-dashboard inside the popover
      content: <MyStatsGrid />,
    },
    {
      target: "#code-block",
      title: <span><code>tsx</code> Code examples in popovers</span>,
      content: (
        <pre style={{ background: "#0f172a", color: "#e2e8f0",
                      borderRadius: 8, padding: 12, fontSize: 11 }}>
          <code>{'{ content: <AnyComponent /> }'}</code>
        </pre>
      ),
    },
  ],
  showProgress: true,
});` },
      { id: "render-popover",label: "Custom popover",      desc: "Replace driver.js's default popover with your own React component", component: <CustomPopoverDemo />, code: `useTour({
  renderPopover: ({ step, next, stop, isLast, stepIndex, totalSteps }) => (
    <div className="my-popover">
      <span>{stepIndex + 1} / {totalSteps}</span>
      <h3>{step.title}</h3>
      <p>{step.content}</p>
      <button onClick={next}>{isLast ? "Done" : "Next →"}</button>
    </div>
  ),
  steps: [...],
});` },
      { id: "spotlight",     label: "Spotlight mode",     desc: "popoverless: true — highlight without a popover",       component: <SpotlightDemo />,    code: `useTour({
  steps: [
    { target: "#a", content: "...", popoverless: true }, // no popover
    { target: "#b", content: "Regular step" },
    { target: "#c", content: "...", popoverless: true }, // no popover
  ],
});` },
      { id: "styling",       label: "Custom styling",     desc: "overlayOpacity, popoverClass, button labels",           component: <StylingDemo />,      code: `useTour({
  overlayOpacity: 0.4,
  popoverClass: "my-theme",
  prevBtnText: "← Prev",
  nextBtnText: "Next →",
  doneBtnText: "✓ Got it",
  steps: [...],
});` },
    ],
  },
  {
    title: "Tour flow",
    items: [
      { id: "conditional",   label: "Conditional steps",  desc: "visibleWhen filters steps based on runtime state",      component: <ConditionalDemo />,  code: `useTour({
  steps: [
    { target: "#dash",    content: "Dashboard." },
    { target: "#upgrade", content: "Upgrade!",
      visibleWhen: () => user.plan === "free" },
    { target: "#pro-feat",content: "Pro only!",
      visibleWhen: () => user.plan === "pro"  },
  ],
});` },
      { id: "can-advance",   label: "canAdvance guard",   desc: "Gate the Next button on a condition — sync or async",   component: <CanAdvanceDemo />,   code: `useTour({
  steps: [{
    target: "#name-field",
    content: "Type your name to continue.",
    canAdvance: () => name.trim().length > 0,
  }, {
    target: "#email-field",
    content: "Enter a valid email.",
    canAdvance: async () => {
      const { valid } = await validateEmail(email);
      return valid;
    },
  }],
});` },
      { id: "auto-advance",  label: "autoAdvanceAfter",   desc: "Advance automatically after N ms — demos, kiosk mode",  component: <AutoAdvanceDemo />,  code: `useTour({
  steps: [
    { target: "#slide-1", content: "Advances in 3 s.", autoAdvanceAfter: 3000 },
    { target: "#slide-2", content: "Manual click also works.", autoAdvanceAfter: 3000 },
    { title: "Done!", content: "Timer is cancelled on manual navigation." },
  ],
});` },
    ],
  },
  {
    title: "Navigation",
    items: [
      { id: "cross-route",   label: "Cross-route",        desc: "beforeNext: () => navigate() across React Router pages",  component: <CrossRouteNote />,   code: `useTour({
  steps: [
    { target: "#product",     content: "Browse." },
    { target: "#add-to-cart", content: "Add to cart.",
      beforeNext: () => navigate("/cart"),
      afterNext:  () => setOpen(false) },
    { target: "#cart-item",   content: "Cart." },
    { target: "#checkout",    content: "Checkout.",
      beforeNext: () => navigate("/checkout") },
    { target: "#pay",         content: "Pay." },
  ],
  waitForTarget: 5000,
});` },
      { id: "action",        label: "Action-driven",      desc: "advanceOn + beforeNext/afterNext for real UI interactions", component: <ActionNote />,       code: `{
  target: "#menu-item",
  advanceOn: "#menu-item",           // element click = Next
  beforeNext: () => setPanel(true),  // open panel, keep element mounted
  afterNext:  () => setMenu(false),  // cleanup after animation completes
}` },
    ],
  },
  {
    title: "Components",
    items: [
      { id: "tooltip",       label: "TourTooltip",        desc: "Non-intrusive tooltip — hover, click, or always visible", component: <TooltipDemo />,      code: `import { TourTooltip } from "@oqlet/react-driver";

// Hover tooltip
<TourTooltip target="#help" content="Click for help." trigger="hover" />

// Always visible with dismiss
<TourTooltip
  target="#new-feature"
  title="✨ New!"
  content="Check this out."
  trigger="always"
  side="bottom"
  onDismiss={() => setDismissed(true)}
/>` },
      { id: "checklist",     label: "TourChecklist",      desc: "Side-panel progress list with jump-to-step",               component: <ChecklistDemo />,    code: `const { start, moveTo, currentStep, isActive } = useTour({ steps });

<TourChecklist
  steps={steps}
  currentStep={currentStep}
  isActive={isActive}
  onJumpTo={moveTo}
  title="Getting started"
/>` },
    ],
  },
  {
    title: "Persistence & analytics",
    items: [
      { id: "persist",       label: "showCount / persist", desc: "Show at most N times, or mark as done after first completion", component: <PersistDemo />,      code: `useTour({
  id: "onboarding",
  showCount: 3,       // stops after 3 starts
  persist: true,      // stops after first completion
  version: "2.0",     // auto-reset when version changes
  steps: [...],
});

import { skipTour, clearTourHistory } from "@oqlet/react-driver";
skipTour("onboarding");        // mark as seen without completing
clearTourHistory("onboarding"); // reset` },
      { id: "analytics",     label: "useTourAnalytics",   desc: "Aggregate step timings, completion rate, drop-off step",    component: <AnalyticsDemo />,    code: `const { controls, summary } = useTourAnalytics({
  steps: [...],
  onFinish: () => analytics.track("tour_complete", {
    completionRate: summary.completionRate,
    avgTimePerStep: summary.avgTimePerStep,
    dropOffStep:    summary.dropOffStep,
  }),
});` },
      { id: "locales",       label: "Locales",            desc: "13 built-in languages for button labels",                  component: <LocalesDemo />,      code: `import { locales } from "@oqlet/react-driver";

// Built-in: en fr es de pt it nl ja zh ko ar ru hi
useTour({ ...locales.fr, steps: [...] });
// prevBtnText: "← Retour"
// nextBtnText: "Suivant →"
// doneBtnText: "Terminer"` },
    ],
  },
];

const ALL_ITEMS = GROUPS.flatMap(g => g.items);

// ── Sidebar Nav — defined OUTSIDE ExamplesPage so React never remounts it ────

interface ExamplesNavProps {
  activeId: string;
  query: string;
  onQuery: (q: string) => void;
  onSelect: (id: string) => void;
  onClose?: () => void;
}

function ExamplesNav({ activeId, query, onQuery, onSelect, onClose }: ExamplesNavProps) {
  const navRef = useRef<HTMLElement>(null);

  // Keep active item visible within the sidebar's own scroll container.
  useEffect(() => {
    if (!navRef.current) return;
    const el = navRef.current.querySelector<HTMLElement>(`[data-item-id="${activeId}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [activeId]);

  const q = query.toLowerCase();
  const filtered = q
    ? GROUPS.map(g => ({ ...g, items: g.items.filter(i => i.label.toLowerCase().includes(q) || i.desc.toLowerCase().includes(q)) })).filter(g => g.items.length > 0)
    : GROUPS;

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 border-b border-gray-100 px-4 pb-3 pt-4 dark:border-zinc-800">
        <div className="relative">
          <svg className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Filter examples…" value={query} onChange={e => onQuery(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-8 pr-3 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300" />
        </div>
      </div>
      <nav ref={navRef} className="flex-1 overflow-y-auto px-3 py-3">
        {filtered.map(g => (
          <div key={g.title} className="mb-4">
            <div className="mb-1 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-zinc-500">{g.title}</div>
            {g.items.map(item => (
              <button key={item.id} data-item-id={item.id}
                onClick={() => { onSelect(item.id); onClose?.(); }}
                className={["flex w-full items-start rounded-lg px-3 py-2 text-left transition-all", activeId === item.id ? "bg-blue-50 dark:bg-blue-950/40" : "hover:bg-gray-100 dark:hover:bg-zinc-800"].join(" ")}>
                <div>
                  <div className={`text-[13px] font-semibold ${activeId === item.id ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-zinc-300"}`}>{item.label}</div>
                  <div className="text-[11px] text-gray-600 dark:text-zinc-600 leading-tight mt-0.5">{item.desc}</div>
                </div>
              </button>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ExamplesPage() {
  const [activeId, setActiveId] = useState("basic");
  const [query, setQuery]       = useState("");
  const [showCode, setShowCode] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const active = ALL_ITEMS.find(i => i.id === activeId) ?? ALL_ITEMS[0];

  const handleSelect = (id: string) => { setActiveId(id); setShowCode(false); };

  return (
    <div className="relative flex min-h-screen bg-white dark:bg-zinc-950">

      {/* Mobile toggle */}
      <div className="sticky top-14 z-30 flex h-10 items-center border-b border-gray-100 bg-white/95 px-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/95 lg:hidden">
        <button onClick={() => setMobileOpen(true)} className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-400">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
          <span className="font-medium">{active.label}</span>
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-72 bg-white shadow-2xl dark:bg-zinc-900">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-zinc-800">
              <span className="font-bold dark:text-white">Examples</span>
              <button onClick={() => setMobileOpen(false)} className="text-gray-500 dark:text-zinc-400">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="h-[calc(100%-3rem)]">
              <ExamplesNav activeId={activeId} query={query} onQuery={setQuery} onSelect={handleSelect} onClose={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 lg:block">
        <div className="sticky top-14 h-[calc(100vh-3.5rem)] border-r border-gray-100 dark:border-zinc-800">
          <ExamplesNav activeId={activeId} query={query} onQuery={setQuery} onSelect={handleSelect} />
        </div>
      </aside>

      {/* Content */}
      <main className="min-w-0 flex-1 px-6 py-10 lg:px-10">
        <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-zinc-500">
          {GROUPS.find(g => g.items.some(i => i.id === activeId))?.title}
        </div>
        <h1 className="mb-1 text-3xl font-black text-gray-900 dark:text-white">{active.label}</h1>
        <p className="mb-8 text-gray-500 dark:text-zinc-400">{active.desc}</p>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          {/* Demo */}
          <DemoPane>{active.component}</DemoPane>

          {/* Code */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[10px] font-bold uppercase tracking-widest text-gray-600 dark:text-zinc-500">Code</div>
              <button onClick={() => setShowCode(s => !s)} className="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400">
                {showCode ? "Hide code ↑" : "Show full code ↓"}
              </button>
            </div>
            {showCode && <CodeBlock code={active.code} />}
            {!showCode && (
              <button
                onClick={() => setShowCode(true)}
                className="w-full rounded-xl border-2 border-dashed border-gray-200 py-4 text-sm text-gray-400 transition-colors hover:border-blue-300 hover:text-blue-500 dark:border-zinc-700 dark:hover:border-blue-700 dark:hover:text-blue-400"
              >
                Click to see code snippet
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
