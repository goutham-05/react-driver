import React, { useState } from "react";
import { useTour, locales } from "@oqlet/react-driver";

// ── Types ─────────────────────────────────────────────────────────────────────

interface StepDraft {
  id: number;
  target: string;
  title: string;
  content: string;
  side: "top" | "bottom" | "left" | "right";
  popoverless: boolean;
  autoAdvanceAfter: string; // "" or ms string
}

interface TourConfig {
  showProgress: boolean;
  overlayOpacity: string;
  locale: string;
  persist: boolean;
  tourId: string;
  showCount: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

let nextId = 1;
const newStep = (): StepDraft => ({
  id: nextId++, target: "", title: "", content: "",
  side: "bottom", popoverless: false, autoAdvanceAfter: "",
});

const INPUT  = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const SELECT = `${INPUT} cursor-pointer`;
const LABEL  = "mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-400";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="rounded px-2 py-1 text-[11px] font-semibold text-zinc-400 hover:text-white transition-all">
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function Toggle({ value, onChange, label }: { value: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2">
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={value} onChange={e => onChange(e.target.checked)} />
        <div className={`h-5 w-9 rounded-full transition-colors ${value ? "bg-blue-600" : "bg-gray-300 dark:bg-zinc-600"}`} />
        <div className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${value ? "translate-x-4" : "translate-x-0.5"}`} />
      </div>
      <span className="text-sm text-gray-700 dark:text-zinc-300">{label}</span>
    </label>
  );
}

// ── Code generator ────────────────────────────────────────────────────────────

function generateCode(steps: StepDraft[], cfg: TourConfig): string {
  const stepsCode = steps.map((s, i) => {
    const parts: string[] = [`    {`];
    if (s.target) parts.push(`\n      target: "${s.target}",`);
    if (s.title)  parts.push(`\n      title: "${s.title}",`);
    parts.push(`\n      content: "${s.content || "…"}",`);
    if (s.side !== "bottom") parts.push(`\n      side: "${s.side}",`);
    if (s.popoverless) parts.push(`\n      popoverless: true,`);
    if (s.autoAdvanceAfter) parts.push(`\n      autoAdvanceAfter: ${s.autoAdvanceAfter},`);
    parts.push(`\n    }`);
    return parts.join("") + (i < steps.length - 1 ? "," : "");
  }).join("\n");

  const localeKey = cfg.locale !== "en" ? cfg.locale : null;
  const localeSpread = localeKey ? `  ...locales.${localeKey},\n` : "";
  const persistLines = cfg.persist && cfg.tourId
    ? `  id: "${cfg.tourId}",\n  persist: true,\n` : "";
  const showCountLine = cfg.showCount ? `  showCount: ${cfg.showCount},\n` : "";
  const opacityLine = cfg.overlayOpacity !== "0.75" ? `  overlayOpacity: ${cfg.overlayOpacity},\n` : "";
  const progressLine = !cfg.showProgress ? `  showProgress: false,\n` : "";

  const imports = localeKey
    ? `import { useTour, locales } from "@oqlet/react-driver";`
    : `import { useTour } from "@oqlet/react-driver";`;

  return `${imports}
import "@oqlet/react-driver/driver.css";

function App() {
  const { start, isActive } = useTour({
${localeSpread}${persistLines}${showCountLine}${opacityLine}${progressLine}    steps: [
${stepsCode}
    ],${cfg.showProgress ? "\n    showProgress: true," : ""}
  });

  return (
    <button onClick={() => start()}>
      {isActive ? "Tour running…" : "Start tour"}
    </button>
  );
}`;
}

// ── Demo area (elements the playground tour can target) ───────────────────────

function DemoArea() {
  return (
    <div className="rounded-2xl border border-dashed border-blue-300 bg-blue-50/40 p-5 dark:border-blue-800/60 dark:bg-blue-950/10">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          Live demo area — these elements can be targeted
        </span>
      </div>
      <div className="space-y-3">
        <div id="pg-nav" className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
          <span className="text-sm font-bold text-gray-600 dark:text-zinc-300">⬡ App</span>
          <span className="text-[11px] font-mono text-gray-400">#pg-nav</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div id="pg-feature-a" className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-1 text-lg">⚡</div>
            <div className="text-xs font-bold">Feature A</div>
            <div className="text-[10px] text-gray-400 font-mono">#pg-feature-a</div>
          </div>
          <div id="pg-feature-b" className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-1 text-lg">🔒</div>
            <div className="text-xs font-bold">Feature B</div>
            <div className="text-[10px] text-gray-400 font-mono">#pg-feature-b</div>
          </div>
          <div id="pg-feature-c" className="rounded-xl border border-gray-200 bg-white p-3 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-1 text-lg">📊</div>
            <div className="text-xs font-bold">Feature C</div>
            <div className="text-[10px] text-gray-400 font-mono">#pg-feature-c</div>
          </div>
        </div>
        <div id="pg-cta" className="rounded-xl border border-blue-200 bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white shadow-sm dark:border-blue-700">
          Call to action button — <span className="font-mono text-blue-200 text-xs">#pg-cta</span>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlaygroundPage() {
  const [steps, setSteps] = useState<StepDraft[]>([
    { id: nextId++, target: "#pg-nav",       title: "Welcome",   content: "This is the app navigation bar.",     side: "bottom", popoverless: false, autoAdvanceAfter: "" },
    { id: nextId++, target: "#pg-feature-a", title: "Feature A", content: "Each feature is highlighted in turn.", side: "bottom", popoverless: false, autoAdvanceAfter: "" },
    { id: nextId++, target: "#pg-cta",       title: "Get started", content: "Click the main CTA to begin.",     side: "top",    popoverless: false, autoAdvanceAfter: "" },
  ]);

  const [cfg, setCfg] = useState<TourConfig>({
    showProgress: true,
    overlayOpacity: "0.75",
    locale: "en",
    persist: false,
    tourId: "",
    showCount: "",
  });

  const updateStep = (id: number, field: keyof StepDraft, value: any) =>
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  const removeStep = (id: number) => setSteps(prev => prev.filter(s => s.id !== id));
  const addStep    = () => setSteps(prev => [...prev, newStep()]);
  const updateCfg  = (field: keyof TourConfig, value: any) => setCfg(prev => ({ ...prev, [field]: value }));

  const localeConfig = cfg.locale !== "en" ? (locales as any)[cfg.locale] : {};

  const { start, isActive, stop } = useTour({
    ...localeConfig,
    id:             cfg.persist && cfg.tourId ? cfg.tourId : undefined,
    persist:        cfg.persist && cfg.tourId ? true : undefined,
    showCount:      cfg.showCount ? Number(cfg.showCount) : undefined,
    showProgress:   cfg.showProgress,
    overlayOpacity: Number(cfg.overlayOpacity),
    steps: steps.map(s => ({
      target:           s.target || undefined,
      title:            s.title  || undefined,
      content:          s.content || "…",
      side:             s.side,
      popoverless:      s.popoverless || undefined,
      autoAdvanceAfter: s.autoAdvanceAfter ? Number(s.autoAdvanceAfter) : undefined,
    })),
  });

  const code = generateCode(steps, cfg);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Interactive</div>
      <h1 className="mb-2 text-4xl font-black">Playground</h1>
      <p className="mb-8 text-lg text-gray-500 dark:text-zinc-400">
        Build a tour visually. The demo area below is the live target — hit ▶ Run tour to preview instantly.
      </p>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">

        {/* ── Left: Step builder ────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Steps ({steps.length})</span>
            <div className="flex gap-2">
              {isActive && <button onClick={stop} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100 dark:border-red-800/50 dark:bg-red-950/20 dark:text-red-400">✕ Stop</button>}
              <button onClick={() => start()} className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
                {isActive ? "✓ Running" : "▶ Run tour"}
              </button>
            </div>
          </div>

          {steps.map((step, i) => (
            <div key={step.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500 dark:text-zinc-400">Step {i + 1}</span>
                <button onClick={() => removeStep(step.id)} className="text-xs text-gray-400 hover:text-red-500 transition-colors dark:text-zinc-600">Remove</button>
              </div>
              <div className="space-y-2.5">
                <div>
                  <label className={LABEL}>Target (CSS selector)</label>
                  <input className={INPUT} placeholder="#pg-nav  ·  .classname" value={step.target} onChange={e => updateStep(step.id, "target", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={LABEL}>Title</label>
                    <input className={INPUT} placeholder="Step title" value={step.title} onChange={e => updateStep(step.id, "title", e.target.value)} />
                  </div>
                  <div>
                    <label className={LABEL}>Side</label>
                    <select className={SELECT} value={step.side} onChange={e => updateStep(step.id, "side", e.target.value as any)}>
                      {(["top","bottom","left","right"] as const).map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className={LABEL}>Content</label>
                  <textarea className={`${INPUT} resize-none`} rows={2} placeholder="Describe this step…" value={step.content} onChange={e => updateStep(step.id, "content", e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className={LABEL}>Auto-advance (ms)</label>
                    <input className={INPUT} type="number" placeholder="e.g. 3000" value={step.autoAdvanceAfter} onChange={e => updateStep(step.id, "autoAdvanceAfter", e.target.value)} />
                  </div>
                  <div className="flex items-end pb-2">
                    <Toggle value={step.popoverless} onChange={v => updateStep(step.id, "popoverless", v)} label="Spotlight only" />
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button onClick={addStep} className="w-full rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:hover:border-blue-700 dark:hover:text-blue-400">
            + Add step
          </button>

          {/* Tour config */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-zinc-800 dark:bg-zinc-900/50">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">Tour config</div>
            <div className="space-y-3">
              <Toggle value={cfg.showProgress} onChange={v => updateCfg("showProgress", v)} label="Show progress" />
              <div>
                <label className={LABEL}>Overlay opacity: {cfg.overlayOpacity}</label>
                <input type="range" min="0.1" max="0.95" step="0.05" value={cfg.overlayOpacity} onChange={e => updateCfg("overlayOpacity", e.target.value)} className="w-full accent-blue-600" />
              </div>
              <div>
                <label className={LABEL}>Locale</label>
                <select className={SELECT} value={cfg.locale} onChange={e => updateCfg("locale", e.target.value)}>
                  {["en","fr","es","de","pt","ja","zh","ko","ar"].map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                </select>
              </div>
              <div>
                <label className={LABEL}>Show count (max starts)</label>
                <input className={INPUT} type="number" placeholder="e.g. 3  (leave empty for unlimited)" value={cfg.showCount} onChange={e => updateCfg("showCount", e.target.value)} />
              </div>
              <Toggle value={cfg.persist} onChange={v => updateCfg("persist", v)} label="Persist completion" />
              {cfg.persist && (
                <div>
                  <label className={LABEL}>Tour ID (required for persist)</label>
                  <input className={INPUT} placeholder="my-tour-v1" value={cfg.tourId} onChange={e => updateCfg("tourId", e.target.value)} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Middle: Demo area + code ───────────────────────────────────── */}
        <div className="xl:col-span-2 space-y-5">

          {/* Live demo area */}
          <DemoArea />

          {/* Generated code */}
          <div className="overflow-hidden rounded-xl border border-zinc-800 bg-[#0d1117]">
            <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/60 px-4 py-2">
              <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-zinc-500">Generated code</span>
              <CopyButton text={code} />
            </div>
            <pre className="overflow-auto p-5 text-[12.5px] leading-relaxed text-zinc-300" style={{ maxHeight: 400 }}>
              <code>{code}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* ── Feature highlights ────────────────────────────────────────────── */}
      <div className="mt-12">
        <div className="mb-4 text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">More features to explore</div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { icon: "🖱️", title: "advanceOn",       body: "Element click = Next" },
            { icon: "👁️", title: "visibleWhen",      body: "Conditional steps" },
            { icon: "🔒", title: "canAdvance",       body: "Gate the Next button" },
            { icon: "💾", title: "persist",          body: "Remember completion" },
            { icon: "🌍", title: "locales",          body: "13 languages" },
            { icon: "📊", title: "useTourAnalytics", body: "Step-level metrics" },
          ].map(f => (
            <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-1.5 text-xl">{f.icon}</div>
              <div className="mb-0.5 text-xs font-bold text-gray-800 dark:text-zinc-200">{f.title}</div>
              <p className="text-[11px] text-gray-500 dark:text-zinc-500">{f.body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
