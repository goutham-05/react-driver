import React, { useState } from "react";
import { useTour } from "@oqlet/react-driver";

interface StepDraft {
  id: number;
  target: string;
  title: string;
  content: string;
  side: string;
}

let nextId = 1;

function defaultStep(): StepDraft {
  return { id: nextId++, target: "", title: "", content: "", side: "bottom" };
}

const INPUT = "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100";
const SELECT = `${INPUT} cursor-pointer`;
const LABEL  = "mb-1 block text-xs font-semibold text-gray-600 dark:text-zinc-400";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button onClick={() => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="rounded px-2 py-1 text-[11px] font-semibold text-zinc-400 hover:text-white transition-all">
      {copied ? "✓ Copied" : "Copy"}
    </button>
  );
}

function generateCode(steps: StepDraft[]): string {
  const stepsCode = steps.map((s, i) => {
    const parts = [`    { `];
    if (s.target)  parts.push(`target: "${s.target}", `);
    if (s.title)   parts.push(`title: "${s.title}", `);
    parts.push(`content: "${s.content || "…"}"`);
    if (s.side && s.side !== "bottom") parts.push(`, side: "${s.side}"`);
    parts.push(` }`);
    return parts.join("") + (i < steps.length - 1 ? "," : "");
  }).join("\n");

  return `import { useTour } from "@oqlet/react-driver";
import "@oqlet/react-driver/driver.css";

function App() {
  const { start, isActive } = useTour({
    steps: [
${stepsCode}
    ],
    showProgress: true,
  });

  return <button onClick={() => start()}>Start tour</button>;
}`;
}

export default function PlaygroundPage() {
  const [steps, setSteps] = useState<StepDraft[]>([
    { id: nextId++, target: "#hero-title", title: "Welcome", content: "This is a live tour built in the playground.", side: "bottom" },
    { id: nextId++, target: "#feature-grid", title: "Features", content: "Scroll down to explore all features.", side: "top" },
  ]);

  const update = (id: number, field: keyof StepDraft, value: string) =>
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));

  const remove = (id: number) => setSteps(prev => prev.filter(s => s.id !== id));
  const add    = () => setSteps(prev => [...prev, defaultStep()]);

  const { start, isActive } = useTour({
    steps: steps.map(s => ({
      target:  s.target  || undefined,
      title:   s.title   || undefined,
      content: s.content || "…",
      side:    (s.side as any) || "bottom",
    })),
    showProgress: true,
  });

  const code = generateCode(steps);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="mb-2 text-4xl font-black">Playground</h1>
      <p className="mb-8 text-lg text-gray-500 dark:text-zinc-400">
        Build a tour visually and see the generated code. Changes are live — hit Run tour to preview.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

        {/* ── Builder ────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
              Steps ({steps.length})
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => start()}
                className={`rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {isActive ? "✓ Tour running" : "▶ Run tour"}
              </button>
            </div>
          </div>

          {steps.map((step, i) => (
            <div key={step.id}
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 dark:text-zinc-500">
                  Step {i + 1}
                </span>
                <button onClick={() => remove(step.id)}
                  className="text-xs text-gray-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 transition-colors">
                  Remove
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className={LABEL}>Target (CSS selector)</label>
                  <input className={INPUT} placeholder="#my-element or .class"
                    value={step.target} onChange={e => update(step.id, "target", e.target.value)} />
                </div>
                <div>
                  <label className={LABEL}>Title</label>
                  <input className={INPUT} placeholder="Step title"
                    value={step.title} onChange={e => update(step.id, "title", e.target.value)} />
                </div>
                <div>
                  <label className={LABEL}>Side</label>
                  <select className={SELECT} value={step.side}
                    onChange={e => update(step.id, "side", e.target.value)}>
                    {["top", "bottom", "left", "right"].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className={LABEL}>Content</label>
                  <textarea className={`${INPUT} resize-none`} rows={2} placeholder="Describe this step…"
                    value={step.content} onChange={e => update(step.id, "content", e.target.value)} />
                </div>
              </div>
            </div>
          ))}

          <button onClick={add}
            className="w-full rounded-xl border-2 border-dashed border-gray-200 py-3 text-sm font-medium text-gray-400 transition-colors hover:border-blue-400 hover:text-blue-600 dark:border-zinc-700 dark:hover:border-blue-600 dark:hover:text-blue-400">
            + Add step
          </button>
        </div>

        {/* ── Code output ─────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-500">
              Generated code
            </span>
          </div>
          <div className="flex-1 overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950">
            <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-2">
              <span className="text-xs text-zinc-500">tsx</span>
              <CopyButton text={code} />
            </div>
            <pre className="h-[520px] overflow-auto p-4 text-xs leading-relaxed text-zinc-300">
              <code>{code}</code>
            </pre>
          </div>
        </div>
      </div>

      {/* ── Feature callouts ──────────────────────────────────────────────── */}
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { icon: "🖱️", title: "advanceOn", body: "Set advanceOn on a step and clicking that element advances the tour — no extra button needed." },
          { icon: "🔁", title: "visibleWhen", body: "Add visibleWhen: () => condition to skip steps that don't apply to the current user." },
          { icon: "💾", title: "persist", body: "Add id + persist: true and completed tours never re-show. Reset with clearTourHistory()." },
        ].map(f => (
          <div key={f.title} className="rounded-xl border border-gray-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="mb-2 text-2xl">{f.icon}</div>
            <div className="mb-1 font-bold text-sm">{f.title}</div>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-zinc-400">{f.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
