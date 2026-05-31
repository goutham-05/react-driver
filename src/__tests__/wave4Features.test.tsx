import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useTour } from "../useTour";
import { useTourAnalytics } from "../useTourAnalytics";
import { useTourHistory } from "../useTourHistory";
import { adapters } from "../adapters";
import {
  getVisitCount, incrementVisitCount,
  getShownCount, incrementShownCount,
  readTourHistory,
} from "../persistence";

// ── Mock driver.js ─────────────────────────────────────────────────────────

const { mockDrive, mockDestroy, mockIsLastStep, mockGetActiveIndex, mockDriverInstance, driverFactoryMock } =
  vi.hoisted(() => {
    const mockDrive          = vi.fn();
    const mockDestroy        = vi.fn();
    const mockIsLastStep     = vi.fn(() => false);
    const mockIsFirstStep    = vi.fn(() => false);
    const mockGetActiveIndex = vi.fn(() => 0);
    const mockDriverInstance = {
      drive: mockDrive, destroy: mockDestroy,
      moveNext: vi.fn(), movePrevious: vi.fn(),
      isLastStep: mockIsLastStep, isFirstStep: mockIsFirstStep,
      getActiveIndex: mockGetActiveIndex, moveTo: vi.fn(),
    };
    return { mockDrive, mockDestroy, mockIsLastStep, mockGetActiveIndex, mockDriverInstance, driverFactoryMock: vi.fn(() => mockDriverInstance) };
  });

vi.mock("driver.js", () => ({ driver: driverFactoryMock }));

const baseSteps = [
  { target: "#a", title: "A", content: "Step A" },
  { target: "#b", title: "B", content: "Step B" },
];

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
// visitCount / shownCount utilities
// ─────────────────────────────────────────────────────────────────────────────

describe("visitCount", () => {
  it("starts at 0 for unknown tour", () => {
    expect(getVisitCount("unknown-tour")).toBe(0);
  });

  it("increments correctly", () => {
    incrementVisitCount("v-tour");
    incrementVisitCount("v-tour");
    expect(getVisitCount("v-tour")).toBe(2);
  });
});

describe("shownCount", () => {
  it("starts at 0", () => {
    expect(getShownCount("s-tour")).toBe(0);
  });

  it("increments correctly", () => {
    incrementShownCount("s-tour");
    incrementShownCount("s-tour");
    expect(getShownCount("s-tour")).toBe(2);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// showCount
// ─────────────────────────────────────────────────────────────────────────────

describe("showCount", () => {
  it("allows starting when shown count is below limit", async () => {
    function Harness() {
      const { start } = useTour({ id: "sc-tour", showCount: 3, steps: baseSteps });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    await act(async () => {
      screen.getByText("start").click();
      await new Promise(r => setTimeout(r, 20));
    });
    expect(mockDrive).toHaveBeenCalled();
  });

  it("blocks starting when shown count reaches limit", async () => {
    incrementShownCount("limited-tour");
    incrementShownCount("limited-tour");
    incrementShownCount("limited-tour"); // already shown 3 times

    function Harness() {
      const { start, isActive } = useTour({ id: "limited-tour", showCount: 3, steps: baseSteps });
      return (
        <div>
          <span data-testid="active">{String(isActive)}</span>
          <button onClick={() => start()}>start</button>
        </div>
      );
    }
    render(<Harness />);
    await act(async () => {
      screen.getByText("start").click();
      await new Promise(r => setTimeout(r, 20));
    });
    expect(mockDrive).not.toHaveBeenCalled();
    expect(screen.getByTestId("active").textContent).toBe("false");
  });

  it("increments shown count each time start is called", async () => {
    function Harness() {
      const { start } = useTour({ id: "count-me", showCount: 5, steps: baseSteps });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    await act(async () => {
      screen.getByText("start").click();
      await new Promise(r => setTimeout(r, 20));
    });
    expect(getShownCount("count-me")).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// keyboard remapping
// ─────────────────────────────────────────────────────────────────────────────

describe("keyboard config", () => {
  it("disables keyboard control when enabled:false", () => {
    function Harness() {
      const { start } = useTour({ steps: baseSteps, keyboard: { enabled: false } });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());
    const cfg = driverFactoryMock.mock.calls[0][0];
    expect(cfg.allowKeyboardControl).toBe(false);
  });

  it("disables driver.js keyboard when custom keys are set (takes over)", () => {
    function Harness() {
      const { start } = useTour({ steps: baseSteps, keyboard: { next: "ArrowRight" } });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());
    const cfg = driverFactoryMock.mock.calls[0][0];
    // driver.js keyboard must be off so our listener is the sole handler
    expect(cfg.allowKeyboardControl).toBe(false);
  });

  it("advances on custom next key", async () => {
    // Add #b so waitForTarget resolves quickly instead of timing out
    document.body.insertAdjacentHTML("beforeend", '<div id="b-kb"></div>');

    function Harness() {
      const { start } = useTour({ steps: [
        { target: "#a", content: "A" },
        { target: "#b-kb", content: "B" },
      ], keyboard: { next: "n" } });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    await act(async () => {
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "n", bubbles: true }));
      await new Promise(r => setTimeout(r, 50));
    });
    expect(mockDriverInstance.moveNext).toHaveBeenCalled();

    document.getElementById("b-kb")?.remove();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// delayAfter
// ─────────────────────────────────────────────────────────────────────────────

describe("delayAfter", () => {
  it("waits before advancing", async () => {
    document.body.insertAdjacentHTML("beforeend", '<div id="b-delay"></div>');
    function Harness() {
      const { start } = useTour({ steps: [
        { target: "#a", content: "A", delayAfter: 30 },
        { target: "#b-delay", content: "B" },
      ] });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());
    const cfg = driverFactoryMock.mock.calls[0][0];
    await act(async () => {
      cfg.onNextClick(undefined, undefined, { driver: mockDriverInstance });
      // Before delay fires, moveNext should not be called
      expect(mockDriverInstance.moveNext).not.toHaveBeenCalled();
      await new Promise(r => setTimeout(r, 100));
    });
    expect(mockDriverInstance.moveNext).toHaveBeenCalled();
    document.getElementById("b-delay")?.remove();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// useTourHistory
// ─────────────────────────────────────────────────────────────────────────────

describe("useTourHistory", () => {
  it("returns empty array when no tours are stored", () => {
    function Harness() {
      const { records } = useTourHistory();
      return <span data-testid="count">{records.length}</span>;
    }
    render(<Harness />);
    expect(screen.getByTestId("count").textContent).toBe("0");
  });

  it("reflects persisted tours", () => {
    incrementVisitCount("hist-tour");
    incrementShownCount("hist-tour");
    function Harness() {
      const { records } = useTourHistory();
      const r = records.find(r => r.id === "hist-tour");
      return (
        <div>
          <span data-testid="found">{r ? "yes" : "no"}</span>
          <span data-testid="visits">{r?.visitCount ?? 0}</span>
        </div>
      );
    }
    render(<Harness />);
    expect(screen.getByTestId("found").textContent).toBe("yes");
    expect(screen.getByTestId("visits").textContent).toBe("1");
  });

  it("clearAll wipes all records", () => {
    incrementVisitCount("wipe-tour");
    function Harness() {
      const { records, clearAll } = useTourHistory();
      return (
        <div>
          <span data-testid="count">{records.length}</span>
          <button onClick={clearAll}>clear</button>
        </div>
      );
    }
    render(<Harness />);
    expect(Number(screen.getByTestId("count").textContent)).toBeGreaterThan(0);
    act(() => screen.getByText("clear").click());
    expect(screen.getByTestId("count").textContent).toBe("0");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// readTourHistory (persistence utility)
// ─────────────────────────────────────────────────────────────────────────────

describe("readTourHistory", () => {
  it("returns empty array when localStorage is empty", () => {
    expect(readTourHistory()).toEqual([]);
  });

  it("includes tours with visit counts", () => {
    incrementVisitCount("rth-tour");
    const history = readTourHistory();
    const r = history.find(r => r.id === "rth-tour");
    expect(r).toBeDefined();
    expect(r?.visitCount).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// useTourAnalytics
// ─────────────────────────────────────────────────────────────────────────────

describe("useTourAnalytics", () => {
  it("tracks startCount on each start", () => {
    function Harness() {
      const { controls, summary } = useTourAnalytics({ steps: baseSteps });
      return (
        <div>
          <span data-testid="starts">{summary.startCount}</span>
          <button onClick={() => controls.start()}>start</button>
        </div>
      );
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());
    expect(screen.getByTestId("starts").textContent).toBe("1");
    act(() => screen.getByText("start").click());
    expect(screen.getByTestId("starts").textContent).toBe("2");
  });

  it("records step exit data", () => {
    const onSkip = vi.fn();
    function Harness() {
      const { controls } = useTourAnalytics({ steps: baseSteps, onSkip });
      return <button onClick={() => controls.start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());
    const cfg = driverFactoryMock.mock.calls[0][0];
    // Simulate step highlighted then exited
    act(() => cfg.onHighlighted(undefined, undefined, { state: { activeIndex: 0 }, driver: mockDriverInstance }));
    act(() => cfg.onNextClick(undefined, undefined, { driver: mockDriverInstance }));
    act(() => cfg.onDeselected(undefined, undefined, { state: { activeIndex: 0 } }));
    // Skip the tour
    act(() => cfg.onDestroyStarted(undefined, undefined, { driver: mockDriverInstance }));
    expect(onSkip).toHaveBeenCalled();
  });

  it("resetAnalytics clears state", () => {
    function Harness() {
      const { controls, summary, resetAnalytics } = useTourAnalytics({ steps: baseSteps });
      return (
        <div>
          <span data-testid="starts">{summary.startCount}</span>
          <button onClick={() => controls.start()}>start</button>
          <button onClick={resetAnalytics}>reset</button>
        </div>
      );
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());
    expect(screen.getByTestId("starts").textContent).toBe("1");
    act(() => screen.getByText("reset").click());
    expect(screen.getByTestId("starts").textContent).toBe("0");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// adapters
// ─────────────────────────────────────────────────────────────────────────────

describe("analytics adapters", () => {
  const makeClient = () => ({ capture: vi.fn(), track: vi.fn() });

  it("posthog adapter fires capture events", () => {
    const client = makeClient();
    const adapter = adapters.posthog(client, { tourId: "test" });
    adapter.onStart?.();
    expect(client.capture).toHaveBeenCalledWith("tour_started", { tour: "test" });
    adapter.onFinish?.();
    expect(client.capture).toHaveBeenCalledWith("tour_completed", { tour: "test" });
    adapter.onSkip?.();
    expect(client.capture).toHaveBeenCalledWith("tour_skipped", { tour: "test" });
  });

  it("segment adapter fires track events", () => {
    const client = makeClient();
    const adapter = adapters.segment(client, { tourId: "test" });
    adapter.onStart?.();
    expect(client.track).toHaveBeenCalledWith("Tour Started", { tour: "test" });
    adapter.onFinish?.();
    expect(client.track).toHaveBeenCalledWith("Tour Completed", { tour: "test" });
  });

  it("mixpanel adapter fires track events", () => {
    const client = makeClient();
    const adapter = adapters.mixpanel(client, { tourId: "test" });
    adapter.onStart?.();
    expect(client.track).toHaveBeenCalledWith("Tour Started", { tour: "test" });
  });

  it("amplitude adapter fires track events", () => {
    const client = makeClient();
    const adapter = adapters.amplitude(client, { tourId: "test" });
    adapter.onStart?.();
    expect(client.track).toHaveBeenCalledWith("tour_started", { tour: "test" });
  });

  it("onStepEnter fires with step index and title", () => {
    const client = makeClient();
    const adapter = adapters.posthog(client, { tourId: "t" });
    adapter.onStepEnter?.(2, { enteredAt: Date.now(), step: baseSteps[0] });
    expect(client.capture).toHaveBeenCalledWith("tour_step_view", expect.objectContaining({ step: 2, tour: "t" }));
  });

  it("onStepExit fires with duration and reason", () => {
    const client = makeClient();
    const adapter = adapters.segment(client, { tourId: "t" });
    adapter.onStepExit?.(1, { duration: 3000, reason: "next", step: baseSteps[0] });
    expect(client.track).toHaveBeenCalledWith("Tour Step Exited", expect.objectContaining({ duration: 3000, reason: "next" }));
  });

  it("all adapters return the five expected hooks", () => {
    const client = makeClient();
    for (const name of ["posthog", "segment", "mixpanel", "amplitude"] as const) {
      const adapter = adapters[name](client);
      expect(typeof adapter.onStart).toBe("function");
      expect(typeof adapter.onFinish).toBe("function");
      expect(typeof adapter.onSkip).toBe("function");
      expect(typeof adapter.onStepEnter).toBe("function");
      expect(typeof adapter.onStepExit).toBe("function");
    }
  });
});
