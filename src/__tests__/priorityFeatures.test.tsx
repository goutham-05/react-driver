import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TourProvider } from "../TourProvider";
import { useTour } from "../useTour";
import { useIsTourActive } from "../useIsTourActive";

// ── Mock driver.js ────────────────────────────────────────────────────────────

const {
  mockDrive, mockDestroy, mockMoveNext, mockMovePrev,
  mockIsLastStep, mockIsFirstStep, mockGetActiveIndex,
  mockDriverInstance, driverFactoryMock,
} = vi.hoisted(() => {
  const mockDrive          = vi.fn();
  const mockDestroy        = vi.fn();
  const mockMoveNext       = vi.fn();
  const mockMovePrev       = vi.fn();
  const mockIsLastStep     = vi.fn(() => false);
  const mockIsFirstStep    = vi.fn(() => false);
  const mockGetActiveIndex = vi.fn(() => 0);
  const mockDriverInstance = {
    drive: mockDrive, destroy: mockDestroy,
    moveNext: mockMoveNext, movePrevious: mockMovePrev,
    isLastStep: mockIsLastStep, isFirstStep: mockIsFirstStep,
    getActiveIndex: mockGetActiveIndex, moveTo: vi.fn(),
  };
  return {
    mockDrive, mockDestroy, mockMoveNext, mockMovePrev,
    mockIsLastStep, mockIsFirstStep, mockGetActiveIndex,
    mockDriverInstance, driverFactoryMock: vi.fn(() => mockDriverInstance),
  };
});

vi.mock("driver.js", () => ({ driver: driverFactoryMock }));

const baseSteps = [
  { target: "#a", content: "Step A" },
  { target: "#b", content: "Step B" },
];

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
// restart()
// ─────────────────────────────────────────────────────────────────────────────

describe("restart()", () => {
  function Harness() {
    const { start, restart, stop, isActive } = useTour({ steps: baseSteps });
    return (
      <div>
        <span data-testid="active">{String(isActive)}</span>
        <button onClick={() => start()}>start</button>
        <button onClick={() => restart()}>restart</button>
        <button onClick={stop}>stop</button>
      </div>
    );
  }

  it("starts the tour from step 0 when already stopped", () => {
    render(<Harness />);
    act(() => screen.getByText("restart").click());
    expect(mockDrive).toHaveBeenCalledWith(0);
    expect(screen.getByTestId("active").textContent).toBe("true");
  });

  it("re-starts the tour from step 0 when already running", () => {
    render(<Harness />);
    act(() => screen.getByText("start").click());
    vi.clearAllMocks();
    act(() => screen.getByText("restart").click());
    // destroy() called on the old instance, drive(0) called on the new one
    expect(mockDestroy).toHaveBeenCalled();
    expect(mockDrive).toHaveBeenCalledWith(0);
  });

  it("does NOT call onSkip when restarting", () => {
    const onSkip = vi.fn();
    function WithSkip() {
      const { start, restart } = useTour({ steps: baseSteps, onSkip });
      return (
        <div>
          <button onClick={() => start()}>start</button>
          <button onClick={() => restart()}>restart</button>
        </div>
      );
    }
    render(<WithSkip />);
    act(() => screen.getByText("start").click());
    act(() => screen.getByText("restart").click());
    expect(onSkip).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// canAdvance
// ─────────────────────────────────────────────────────────────────────────────

describe("canAdvance", () => {
  it("allows advancing when canAdvance returns true", async () => {
    // Add #b so waitForElement resolves immediately instead of timing out
    document.body.insertAdjacentHTML("beforeend", '<div id="b"></div>');
    function Harness() {
      const { start } = useTour({
        steps: [
          { target: "#a", content: "A", canAdvance: () => true },
          { target: "#b", content: "B" },
        ],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    // Wait long enough for canAdvance + waitForElement + setTimeout(0) to resolve
    await act(async () => {
      cfg.onNextClick(undefined, undefined, { driver: mockDriverInstance });
      await new Promise(r => setTimeout(r, 50));
    });
    expect(mockMoveNext).toHaveBeenCalled();
    document.getElementById("b")?.remove();
  });

  it("blocks advancing when canAdvance returns false", async () => {
    function Harness() {
      const { start } = useTour({
        steps: [
          { target: "#a", content: "A", canAdvance: () => false },
          { target: "#b", content: "B" },
        ],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    await act(async () => cfg.onNextClick(undefined, undefined, { driver: mockDriverInstance }));
    // moveNext should NOT be called
    expect(mockMoveNext).not.toHaveBeenCalled();
  });

  it("supports async canAdvance (Promise)", async () => {
    function Harness() {
      const { start } = useTour({
        steps: [
          { target: "#a", content: "A", canAdvance: () => Promise.resolve(false) },
          { target: "#b", content: "B" },
        ],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    await act(async () => cfg.onNextClick(undefined, undefined, { driver: mockDriverInstance }));
    expect(mockMoveNext).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// autoAdvanceAfter
// ─────────────────────────────────────────────────────────────────────────────

describe("autoAdvanceAfter", () => {
  it("calls moveNext after the specified delay", async () => {
    // Add #b so waitForElement inside advanceStep resolves immediately
    document.body.insertAdjacentHTML("beforeend", '<div id="b-auto"></div>');
    function Harness() {
      const { start } = useTour({
        steps: [
          { target: "#a", content: "A", autoAdvanceAfter: 30 },
          { target: "#b-auto", content: "B" },
        ],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    act(() => cfg.onHighlighted(undefined, undefined, { state: { activeIndex: 0 }, driver: mockDriverInstance }));

    expect(mockMoveNext).not.toHaveBeenCalled();
    // Wait for autoAdvanceAfter (30ms) + waitForTarget settle time
    await act(async () => { await new Promise(r => setTimeout(r, 100)); });
    expect(mockMoveNext).toHaveBeenCalled();
    document.getElementById("b-auto")?.remove();
  });

  it("clears the timer when the step changes before it fires", async () => {
    function Harness() {
      const { start } = useTour({
        steps: [
          { target: "#a", content: "A", autoAdvanceAfter: 200 },
          { target: "#b", content: "B" },
        ],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    act(() => cfg.onHighlighted(undefined, undefined, { state: { activeIndex: 0 }, driver: mockDriverInstance }));

    // Deselect (step changes) before the 200ms timer fires
    act(() => cfg.onDeselected(undefined, undefined, { state: { activeIndex: 0 } }));

    // Wait past the timer — it should have been cancelled
    await act(async () => { await new Promise(r => setTimeout(r, 250)); });
    expect(mockMoveNext).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Analytics — onStepEnter / onStepExit
// ─────────────────────────────────────────────────────────────────────────────

describe("analytics hooks", () => {
  it("fires onStepEnter when a step is highlighted", () => {
    const onStepEnter = vi.fn();
    function Harness() {
      const { start } = useTour({ steps: baseSteps, onStepEnter });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    act(() => cfg.onHighlighted(undefined, undefined, { state: { activeIndex: 0 }, driver: mockDriverInstance }));

    expect(onStepEnter).toHaveBeenCalledOnce();
    const [idx, meta] = onStepEnter.mock.calls[0];
    expect(idx).toBe(0);
    expect(typeof meta.enteredAt).toBe("number");
    expect(meta.step).toBeDefined();
  });

  it("fires onStepExit with duration and reason='next' on Next click", () => {
    const onStepExit = vi.fn();
    function Harness() {
      const { start } = useTour({ steps: baseSteps, onStepExit });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    act(() => cfg.onHighlighted(undefined, undefined, { state: { activeIndex: 0 }, driver: mockDriverInstance }));
    act(() => cfg.onNextClick(undefined, undefined, { driver: mockDriverInstance }));
    act(() => cfg.onDeselected(undefined, undefined, { state: { activeIndex: 0 } }));

    expect(onStepExit).toHaveBeenCalledOnce();
    const [idx, meta] = onStepExit.mock.calls[0];
    expect(idx).toBe(0);
    expect(meta.reason).toBe("next");
    expect(typeof meta.duration).toBe("number");
  });

  it("fires onStepExit with reason='prev' on Back click", () => {
    const onStepExit = vi.fn();
    function Harness() {
      const { start } = useTour({ steps: baseSteps, onStepExit });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    act(() => cfg.onHighlighted(undefined, undefined, { state: { activeIndex: 1 }, driver: mockDriverInstance }));
    act(() => cfg.onPrevClick(undefined, undefined, { driver: { ...mockDriverInstance, isFirstStep: () => false, getActiveIndex: () => 1 } }));
    act(() => cfg.onDeselected(undefined, undefined, { state: { activeIndex: 1 } }));

    expect(onStepExit.mock.calls[0][1].reason).toBe("prev");
  });

  it("fires onStepExit with reason='skip' when tour is dismissed", () => {
    const onStepExit = vi.fn();
    function Harness() {
      const { start } = useTour({ steps: baseSteps, onStepExit });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    act(() => cfg.onHighlighted(undefined, undefined, { state: { activeIndex: 0 }, driver: mockDriverInstance }));
    act(() => cfg.onDestroyStarted(undefined, undefined, { driver: mockDriverInstance }));
    act(() => cfg.onDeselected(undefined, undefined, { state: { activeIndex: 0 } }));

    expect(onStepExit.mock.calls[0][1].reason).toBe("skip");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// useIsTourActive
// ─────────────────────────────────────────────────────────────────────────────

describe("useIsTourActive", () => {
  function ActiveDisplay() {
    const active = useIsTourActive();
    return <span data-testid="active">{String(active)}</span>;
  }

  function TourStarter() {
    const { start, stop } = useTour({ steps: baseSteps });
    return (
      <>
        <button onClick={() => start()}>start</button>
        <button onClick={stop}>stop</button>
      </>
    );
  }

  it("returns false when no tour is running", () => {
    render(
      <TourProvider>
        <ActiveDisplay />
        <TourStarter />
      </TourProvider>
    );
    expect(screen.getByTestId("active").textContent).toBe("false");
  });

  it("returns true while a tour is active", () => {
    render(
      <TourProvider>
        <ActiveDisplay />
        <TourStarter />
      </TourProvider>
    );
    act(() => screen.getByText("start").click());
    expect(screen.getByTestId("active").textContent).toBe("true");
  });

  it("returns false after the tour is stopped", () => {
    render(
      <TourProvider>
        <ActiveDisplay />
        <TourStarter />
      </TourProvider>
    );
    act(() => screen.getByText("start").click());
    act(() => screen.getByText("stop").click());
    expect(screen.getByTestId("active").textContent).toBe("false");
  });

  it("returns false outside TourProvider", () => {
    render(<ActiveDisplay />);
    expect(screen.getByTestId("active").textContent).toBe("false");
  });
});
