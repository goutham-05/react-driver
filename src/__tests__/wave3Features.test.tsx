import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTour } from "../useTour";
import { TourChecklist } from "../TourChecklist";
import { locales } from "../locales";
import { useStepRef } from "../useStepRef";
import { skipTour, hasSeenTour, clearTourHistory, saveProgress, loadProgress, clearProgress } from "../persistence";

// ── Mock driver.js ─────────────────────────────────────────────────────────

const { mockDrive, mockDriverInstance, driverFactoryMock } = vi.hoisted(() => {
  const mockDrive = vi.fn();
  const mockDriverInstance = {
    drive: mockDrive, destroy: vi.fn(),
    moveNext: vi.fn(), movePrevious: vi.fn(),
    isLastStep: vi.fn(() => false), isFirstStep: vi.fn(() => false),
    getActiveIndex: vi.fn(() => 0), moveTo: vi.fn(),
  };
  return { mockDrive, mockDriverInstance, driverFactoryMock: vi.fn(() => mockDriverInstance) };
});
vi.mock("driver.js", () => ({ driver: driverFactoryMock }));

const baseSteps = [
  { target: "#a", title: "Step A", content: "A" },
  { target: "#b", title: "Step B", content: "B" },
  { target: "#c", title: "Step C", content: "C" },
];

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
// version — auto-invalidate persistence on version change
// ─────────────────────────────────────────────────────────────────────────────

describe("version", () => {
  it("starts the tour when stored version does not match current version", () => {
    // Simulate user completed v1
    skipTour("ver-tour", true, "1.0");

    function Harness() {
      const { start } = useTour({ id: "ver-tour", persist: true, version: "2.0", steps: baseSteps });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());
    // v2 is new — tour should start
    expect(mockDrive).toHaveBeenCalled();
  });

  it("skips the tour when stored version matches", () => {
    skipTour("same-ver", true, "1.0");
    function Harness() {
      const { start } = useTour({ id: "same-ver", persist: true, version: "1.0", steps: baseSteps });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());
    expect(mockDrive).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// persistProgress — resume from last step
// ─────────────────────────────────────────────────────────────────────────────

describe("persistProgress", () => {
  it("saves progress on step change", () => {
    function Harness() {
      const { start } = useTour({ id: "progress-tour", persistProgress: true, steps: baseSteps });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    act(() => cfg.onHighlightStarted(undefined, undefined, { state: { activeIndex: 2 } }));

    expect(loadProgress("progress-tour", true)).toBe(2);
  });

  it("resumes from saved step on start", async () => {
    saveProgress("resume-tour", 2, true);
    function Harness() {
      const { start } = useTour({ id: "resume-tour", persistProgress: true, steps: baseSteps });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    await act(async () => {
      screen.getByText("start").click();
      await new Promise(r => setTimeout(r, 20));
    });
    expect(mockDrive).toHaveBeenCalledWith(2);
  });

  it("clears progress when tour finishes", () => {
    saveProgress("finish-tour", 1, true);
    mockDriverInstance.isLastStep.mockReturnValueOnce(true);
    function Harness() {
      const { start } = useTour({ id: "finish-tour", persistProgress: true, steps: baseSteps });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    act(() => cfg.onDestroyStarted(undefined, undefined, { driver: mockDriverInstance }));

    expect(loadProgress("finish-tour", true)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Progress utilities (persistence.ts)
// ─────────────────────────────────────────────────────────────────────────────

describe("progress utilities", () => {
  it("saveProgress + loadProgress round-trip", () => {
    saveProgress("pt-tour", 3, true);
    expect(loadProgress("pt-tour", true)).toBe(3);
  });

  it("clearProgress removes entry", () => {
    saveProgress("cp-tour", 1, true);
    clearProgress("cp-tour", true);
    expect(loadProgress("cp-tour", true)).toBeNull();
  });

  it("clearTourHistory removes progress too", () => {
    saveProgress("ct-tour", 2, true);
    clearTourHistory("ct-tour");
    expect(loadProgress("ct-tour", true)).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// popoverless
// ─────────────────────────────────────────────────────────────────────────────

describe("popoverless", () => {
  it("includes onPopoverRender that hides the wrapper for popoverless steps", () => {
    function Harness() {
      const { start } = useTour({
        steps: [{ target: "#a", content: "A", popoverless: true }],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const driveStep = driverFactoryMock.mock.calls[0][0].steps[0];
    expect(typeof driveStep.popover.onPopoverRender).toBe("function");
  });

  it("non-popoverless steps do not have onPopoverRender from popoverless", () => {
    function Harness() {
      const { start } = useTour({
        steps: [{ target: "#a", content: "A" }],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const driveStep = driverFactoryMock.mock.calls[0][0].steps[0];
    expect(driveStep.popover.onPopoverRender).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// mobileOverrides
// ─────────────────────────────────────────────────────────────────────────────

describe("mobileOverrides", () => {
  it("applies mobileOverrides when viewport is narrow", () => {
    // Simulate narrow viewport
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 375 });

    function Harness() {
      const { start } = useTour({
        breakpoint: 768,
        steps: [{
          target: "#a",
          content: "Desktop content",
          side: "right",
          mobileOverrides: { content: "Mobile content", side: "bottom" },
        }],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const driveStep = driverFactoryMock.mock.calls[0][0].steps[0];
    expect(driveStep.popover.description).toBe("Mobile content");
    expect(driveStep.popover.side).toBe("bottom");

    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1024 });
  });

  it("does not apply mobileOverrides on wide viewport", () => {
    Object.defineProperty(window, "innerWidth", { writable: true, configurable: true, value: 1024 });

    function Harness() {
      const { start } = useTour({
        breakpoint: 768,
        steps: [{
          target: "#a",
          content: "Desktop content",
          side: "right",
          mobileOverrides: { content: "Mobile content", side: "bottom" },
        }],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const driveStep = driverFactoryMock.mock.calls[0][0].steps[0];
    expect(driveStep.popover.description).toBe("Desktop content");
    expect(driveStep.popover.side).toBe("right");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// locales
// ─────────────────────────────────────────────────────────────────────────────

describe("locales", () => {
  it("exports locale configs for major languages", () => {
    expect(locales.en).toBeDefined();
    expect(locales.fr).toBeDefined();
    expect(locales.es).toBeDefined();
    expect(locales.de).toBeDefined();
    expect(locales.ja).toBeDefined();
    expect(locales.zh).toBeDefined();
    expect(locales.ar).toBeDefined();
  });

  it("each locale has prevBtnText, nextBtnText, doneBtnText", () => {
    for (const [code, locale] of Object.entries(locales)) {
      expect(locale.prevBtnText, `${code}.prevBtnText`).toBeTruthy();
      expect(locale.nextBtnText, `${code}.nextBtnText`).toBeTruthy();
      expect(locale.doneBtnText, `${code}.doneBtnText`).toBeTruthy();
    }
  });

  it("locale strings are passed through to driver.js config", () => {
    function Harness() {
      const { start } = useTour({ ...locales.fr, steps: baseSteps });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    expect(cfg.prevBtnText).toBe(locales.fr.prevBtnText);
    expect(cfg.nextBtnText).toBe(locales.fr.nextBtnText);
    expect(cfg.doneBtnText).toBe(locales.fr.doneBtnText);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// useStepRef
// ─────────────────────────────────────────────────────────────────────────────

describe("useStepRef", () => {
  it("returns a ref and a CSS selector string", () => {
    function Harness() {
      const { ref, target } = useStepRef("my-step");
      return (
        <div>
          <button ref={ref}>My button</button>
          <span data-testid="target">{target}</span>
        </div>
      );
    }
    render(<Harness />);
    expect(screen.getByTestId("target").textContent).toBe('[data-tour-ref="my-step"]');
  });

  it("sets data-tour-ref attribute on the element", () => {
    function Harness() {
      const { ref } = useStepRef("button-ref");
      return <button ref={ref}>Button</button>;
    }
    render(<Harness />);
    expect(screen.getByText("Button").dataset.tourRef).toBe("button-ref");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TourChecklist — section headers
// ─────────────────────────────────────────────────────────────────────────────

describe("TourChecklist section headers", () => {
  const sectioned = [
    { target: "#a", title: "Step A", content: "A", section: "Setup" },
    { target: "#b", title: "Step B", content: "B", section: "Setup" },
    { target: "#c", title: "Step C", content: "C", section: "Explore" },
    { target: "#d", title: "Step D", content: "D", section: "Explore" },
  ];

  it("renders section headers when section prop is set", () => {
    render(<TourChecklist steps={sectioned} currentStep={0} isActive={true} onJumpTo={vi.fn()} />);
    expect(screen.getByText("Setup")).toBeInTheDocument();
    expect(screen.getByText("Explore")).toBeInTheDocument();
  });

  it("does not duplicate section headers for consecutive steps in the same section", () => {
    render(<TourChecklist steps={sectioned} currentStep={0} isActive={true} onJumpTo={vi.fn()} />);
    expect(screen.getAllByText("Setup")).toHaveLength(1);
    expect(screen.getAllByText("Explore")).toHaveLength(1);
  });

  it("renders no section headers when no steps have section", () => {
    render(<TourChecklist steps={baseSteps} currentStep={0} isActive={true} onJumpTo={vi.fn()} />);
    // Section headers are just text nodes — none of the base steps have section
    expect(screen.queryByText("Setup")).not.toBeInTheDocument();
  });
});
