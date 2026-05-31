import React from "react";
import type { TourStep, TourControls } from "./types";

interface TourChecklistProps {
  /** The steps array passed to useTour (after visibleWhen filtering is applied). */
  steps: TourStep[];
  /** currentStep from useTour controls. */
  currentStep: number;
  /** isActive from useTour controls. */
  isActive: boolean;
  /** moveTo from useTour controls — called when the user clicks a step. */
  onJumpTo: TourControls["moveTo"];
  /** Title shown above the checklist. Default: "Tour progress". */
  title?: string;
  /** Extra CSS class on the root element. */
  className?: string;
}

export function TourChecklist({
  steps,
  currentStep,
  isActive,
  onJumpTo,
  title = "Tour progress",
  className,
}: TourChecklistProps) {
  let lastSection: string | undefined = undefined;

  return (
    <div
      className={className}
      style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: "16px 20px",
        minWidth: 220,
        boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      }}
    >
      <p style={{ fontWeight: 700, fontSize: 13, color: "#374151", margin: "0 0 12px" }}>
        {title}
      </p>

      <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 2 }}>
        {steps.map((step, idx) => {
          const done   = isActive ? idx < currentStep  : false;
          const active = isActive && idx === currentStep;

          // Render a section header when the section label changes.
          const showSection = step.section && step.section !== lastSection;
          if (step.section) lastSection = step.section;

          return (
            <React.Fragment key={idx}>
              {showSection && (
                <li style={{
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.06em",
                  textTransform: "uppercase", color: "#9ca3af",
                  padding: "8px 8px 4px",
                  marginTop: idx > 0 ? 6 : 0,
                }}>
                  {step.section}
                </li>
              )}
              <li>
                <button
                  onClick={() => isActive && onJumpTo(idx)}
                  disabled={!isActive}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    width: "100%",
                    background: active ? "#eff6ff" : "transparent",
                    border: "none", borderRadius: 6,
                    padding: "6px 8px", cursor: isActive ? "pointer" : "default",
                    textAlign: "left", transition: "background 0.15s",
                  }}
                >
                  <span style={{
                    width: 18, height: 18, borderRadius: "50%", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, fontWeight: 700,
                    background: done ? "#22c55e" : active ? "#3b82f6" : "#f1f5f9",
                    color:      done ? "#fff"    : active ? "#fff"    : "#94a3b8",
                    border: `2px solid ${done ? "#22c55e" : active ? "#3b82f6" : "#e2e8f0"}`,
                  }}>
                    {done ? "✓" : idx + 1}
                  </span>
                  <span style={{
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: done ? "#6b7280" : active ? "#1d4ed8" : "#374151",
                    textDecoration: done ? "line-through" : "none",
                  }}>
                    {typeof step.title === "string" ? step.title : `Step ${idx + 1}`}
                  </span>
                </button>
              </li>
            </React.Fragment>
          );
        })}
      </ol>

      {steps.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ height: 4, borderRadius: 2, background: "#f1f5f9", overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 2, background: "#3b82f6",
              width: `${(currentStep / Math.max(steps.length - 1, 1)) * 100}%`,
              transition: "width 0.3s ease",
            }} />
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af", margin: "6px 0 0", textAlign: "right" }}>
            {isActive ? `${currentStep + 1} of ${steps.length}` : `${steps.length} steps`}
          </p>
        </div>
      )}
    </div>
  );
}
TourChecklist.displayName = 'TourChecklist';
