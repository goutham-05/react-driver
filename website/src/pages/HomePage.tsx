import React, { useState } from "react";
import { Link } from "react-router-dom";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="rounded px-2 py-1 text-[11px] font-semibold transition-all text-zinc-400 hover:text-white"
    >
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function CodeBlock({ code, lang = "tsx" }: { code: string; lang?: string }) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
        <span className="text-xs text-zinc-500">{lang}</span>
        <CopyButton text={code} />
      </div>
      <pre className="overflow-x-auto p-4 text-sm leading-relaxed text-zinc-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}

const QUICK_START = `import { useTour } from "@oqlet/react-driver";
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
}`;

const CROSS_ROUTE = `const { start } = useTour({
  steps: [
    { target: "#product",      content: "Here's the product." },
    { target: "#add-to-cart",  content: "Add it to your cart.",
      beforeNext: () => navigate("/cart"),       // navigate between routes
      afterNext:  () => setCartOpen(false) },    // clean up after animation
    { target: "#cart-item",    content: "Your item is here." },
    { target: "#checkout-btn", content: "Proceed to checkout.",
      beforeNext: () => navigate("/checkout") },
    { target: "#pay-btn",      content: "Complete your purchase." },
  ],
});`;

const ACTION_TOUR = `const { start } = useTour({
  steps: [
    { target: "#menu-edit-profile",
      title: "Edit profile",
      content: "Click it or press Next to continue.",
      advanceOn: "#menu-edit-profile",        // clicking the item advances the tour
      beforeNext: () => setActivePanel("profile"),
      afterNext:  () => setMenuOpen(false) },
    { target: "#panel-profile",
      title: "Profile settings",
      content: "All your details in one place." },
  ],
});`;

const features = [
  { icon: "⚡", title: "One hook",            body: "useTour gives you start, stop, next, prev, moveTo, isActive, totalSteps. That's the whole API." },
  { icon: "🎨", title: "JSX content",         body: "title and content accept any ReactNode — images, videos, buttons, styled text. The library renders React into driver.js's popover." },
  { icon: "🔒", title: "Persist completion",  body: "id + persist: true stores completion in localStorage. Tours don't re-show after the first visit — no extra code." },
  { icon: "🔀", title: "Conditional steps",   body: "visibleWhen: () => boolean skips steps at runtime. Feature flags, user roles, plan tiers — evaluated fresh on every start()." },
  { icon: "🗺️", title: "Cross-route",         body: "beforeNext navigates between React Router routes. The library waits for the next target to appear before advancing." },
  { icon: "🖱️", title: "Action-driven",       body: "advanceOn lets a real element advance the tour when clicked. afterNext / afterPrev fire after animation — always safe to unmount." },
  { icon: "📛", title: "Named registry",      body: "useRegisterTour + useTourControls. Define a tour in your layout, start it from any child — no prop drilling." },
  { icon: "🦺", title: "TypeScript-first",    body: "Full types for every prop including ReactNode content. Autocomplete for the entire step config." },
  { icon: "🎛️", title: "Headless",            body: "Built on driver.js. Bring your own CSS, popoverClass per step, overlayOpacity, custom button labels." },
];

export default function HomePage() {
  return (
    <div className="bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-gray-100 dark:border-zinc-900 px-6 pb-20 pt-24 text-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-[500px] w-[800px] rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
        </div>

        <div className="relative mx-auto max-w-3xl animate-fade-in">
          <a
            href="https://driverjs.com"
            target="_blank"
            rel="noreferrer"
            className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 no-underline transition-colors hover:bg-blue-100 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300 dark:hover:bg-blue-900/50"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
            Powered by driver.js ↗
          </a>

          <h1 className="mb-4 text-5xl font-black tracking-tight leading-tight">
            Guided tours that{" "}
            <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
              just work
            </span>
          </h1>

          <p className="mx-auto mb-8 max-w-xl text-lg text-gray-500 dark:text-zinc-400">
            Schema-driven, plug-and-play guided tours for React. Define steps as data.
            Cross-route navigation, action-driven interactions, zero driver.js boilerplate.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link to="/docs" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white no-underline transition-colors hover:bg-blue-700">
              Get started →
            </Link>
            <Link to="/examples" className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 no-underline transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
              View examples
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {[
              "TypeScript-first",
              "SSR safe",
              "Zero peer deps",
              "React 17 · 18 · 19",
              "MIT license",
            ].map(b => (
              <span key={b} className="rounded-full border border-gray-200 bg-white px-3 py-1 text-[11px] font-semibold text-gray-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
                {b}
              </span>
            ))}
          </div>

          {/* Install command */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 font-mono text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <span className="text-gray-400">$</span>
            <span className="text-gray-800 dark:text-zinc-200">npm install @oqlet/react-driver</span>
            <CopyButton text="npm install @oqlet/react-driver" />
          </div>
        </div>
      </section>

      {/* ── Stats strip ───────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-gray-50/60 dark:border-zinc-900 dark:bg-zinc-900/40 px-6 py-10">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { value: "~12 KB", label: "gzipped bundle",   sub: "ESM + CSS"          },
            { value: "128",    label: "unit tests",        sub: "vitest"              },
            { value: "31",     label: "E2E tests",         sub: "Playwright"          },
            { value: "30+",    label: "API features",      sub: "hooks, components"   },
            { value: "13",     label: "built-in locales",  sub: "i18n ready"          },
            { value: "4",      label: "analytics adapters",sub: "PostHog, Segment ···"},
          ].map(s => (
            <div key={s.value} className="flex flex-col items-center text-center">
              <span className="text-3xl font-black tracking-tight text-gray-900 dark:text-white">{s.value}</span>
              <span className="mt-0.5 text-[13px] font-semibold text-gray-600 dark:text-zinc-300">{s.label}</span>
              <span className="text-[11px] text-gray-400 dark:text-zinc-600">{s.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick start ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Quick start</div>
        <h2 className="mb-2 text-3xl font-bold">Up and running in 60 seconds</h2>
        <p className="mb-8 text-gray-500 dark:text-zinc-400">One hook. Describe your steps as a plain array. Done.</p>
        <CodeBlock code={QUICK_START} />
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50/50 dark:border-zinc-900 dark:bg-zinc-900/30 px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-3 text-xs font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Features</div>
          <h2 className="mb-10 text-3xl font-bold">Everything you need, nothing you don't</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(f => (
              <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
                <div className="mb-3 text-2xl">{f.icon}</div>
                <div className="mb-1.5 font-bold">{f.title}</div>
                <p className="text-sm leading-relaxed text-gray-500 dark:text-zinc-400">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cross-route ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <div className="grid grid-cols-2 items-center gap-12">
          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-widest text-violet-600 dark:text-violet-400">Cross-route navigation</div>
            <h2 className="mb-3 text-3xl font-bold">Tours that span multiple pages</h2>
            <p className="mb-4 text-gray-500 dark:text-zinc-400">
              Use <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm dark:bg-zinc-800">beforeNext</code> to
              navigate with React Router between tour steps. The library waits for the next
              step's target to appear in the DOM before advancing — no manual timing required.
            </p>
            <Link to="/examples" className="text-sm font-semibold text-blue-600 no-underline hover:underline dark:text-blue-400">
              See shopping tour demo →
            </Link>
          </div>
          <CodeBlock code={CROSS_ROUTE} />
        </div>
      </section>

      {/* ── Action-driven ─────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50/50 dark:border-zinc-900 dark:bg-zinc-900/30 px-6 py-20">
        <div className="mx-auto max-w-5xl grid grid-cols-2 items-center gap-12">
          <CodeBlock code={ACTION_TOUR} />
          <div>
            <div className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Action-driven tours</div>
            <h2 className="mb-3 text-3xl font-bold">Real interactions, not fake overlays</h2>
            <p className="mb-4 text-gray-500 dark:text-zinc-400">
              <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm dark:bg-zinc-800">advanceOn</code> makes
              any element a "Next" trigger. When clicked, the library owns the interaction,
              fires <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm dark:bg-zinc-800">beforeNext</code>,
              and waits for the DOM to settle — all in one clean step definition.
            </p>
            <Link to="/examples" className="text-sm font-semibold text-blue-600 no-underline hover:underline dark:text-blue-400">
              See auth tour demo →
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="px-6 py-20 text-center">
        <div className="mx-auto max-w-lg">
          <h2 className="mb-3 text-3xl font-bold">Ready to ship?</h2>
          <p className="mb-8 text-gray-500 dark:text-zinc-400">Install in 30 seconds. Full docs and live examples included.</p>
          <div className="flex justify-center gap-3">
            <Link to="/docs" className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-blue-700">
              Read the docs
            </Link>
            <a href="https://github.com/goutham-05/react-driver" target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 no-underline hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800">
              GitHub
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
