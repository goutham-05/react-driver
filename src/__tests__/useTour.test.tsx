import React, { createRef } from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TourProvider } from "../TourProvider";
import { TourContext } from "../TourContext";
import { useTour } from "../useTour";

// ─── Mock driver.js ───────────────────────────────────────────────────────────
// driver.js requires real browser layout APIs that jsdom does not implement.
// We mock the factory to test the React integration layer in isolation.

const mockDrive = vi.fn();
const mockDestroy = vi.fn();
const mockMoveNext = vi.fn();
const mockMovePrevious = vi.fn();
const mockMoveTo = vi.fn();
const mockIsLastStep = vi.fn(() => false);

const mockDriverInstance = {
  drive: mockDrive,
  destroy: mockDestroy,
  moveNext: mockMoveNext,
  movePrevious: mockMovePrevious,
  moveTo: mockMoveTo,
  isLastStep: mockIsLastStep,
};

vi.mock("driver.js", () => ({
  driver: vi.fn(() => mockDriverInstance),
}));

// ─── Shared fixtures ──────────────────────────────────────────────────────────

const baseSteps = [
  { target: "#step-1", title: "Step 1", content: "First stop." },
  { target: "#step-2", title: "Step 2", content: "Second stop." },
];

function Harness({
  onStart = vi.fn(),
  onFinish = vi.fn(),
  onSkip = vi.fn(),
}: {
  onStart?: () => void;
  onFinish?: () => void;
  onSkip?: () => void;
} = {}) {
  const { start, stop, next, prev, moveTo, isActive, currentStep } = useTour({
    steps: baseSteps,
    onStart,
    onFinish,
    onSkip,
  });

  return (
    <div>
      <span data-testid="active">{String(isActive)}</span>
      <span data-testid="step">{currentStep}</span>
      <button onClick={() => start()}>start</button>
      <button onClick={() => start(1)}>start-at-1</button>
      <button onClick={stop}>stop</button>
      <button onClick={next}>next</button>
      <button onClick={prev}>prev</button>
      <button onClick={() => moveTo(1)}>moveTo</button>
    </div>
  );
}

// ─── useTour — standalone ─────────────────────────────────────────────────────

describe("useTour — state", () => {
  beforeEach(() => vi.clearAllMocks());

  it("starts inactive", () => {
    render(<Harness />);
    expect(screen.getByTestId("active").textContent).toBe("false");
    expect(screen.getByTestId("step").textContent).toBe("0");
  });

  it("sets isActive true after start()", () => {
    render(<Harness />);
    act(() => screen.getByText("start").click());
    expect(screen.getByTestId("active").textContent).toBe("true");
  });

  it("calls drive(0) by default", () => {
    render(<Harness />);
    act(() => screen.getByText("start").click());
    expect(mockDrive).toHaveBeenCalledWith(0);
  });

  it("calls drive(1) when start(1) is called", () => {
    render(<Harness />);
    act(() => screen.getByText("start-at-1").click());
    expect(mockDrive).toHaveBeenCalledWith(1);
  });

  it("resets to inactive after stop()", () => {
    render(<Harness />);
    act(() => screen.getByText("start").click());
    act(() => screen.getByText("stop").click());
    expect(mockDestroy).toHaveBeenCalled();
    expect(screen.getByTestId("active").textContent).toBe("false");
  });
});

describe("useTour — callbacks", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls onStart when tour begins", () => {
    const onStart = vi.fn();
    render(<Harness onStart={onStart} />);
    act(() => screen.getByText("start").click());
    expect(onStart).toHaveBeenCalledOnce();
  });
});

describe("useTour — controls", () => {
  beforeEach(() => vi.clearAllMocks());

  it("next() calls moveNext on the driver instance", () => {
    render(<Harness />);
    act(() => screen.getByText("start").click());
    act(() => screen.getByText("next").click());
    expect(mockMoveNext).toHaveBeenCalled();
  });

  it("prev() calls movePrevious on the driver instance", () => {
    render(<Harness />);
    act(() => screen.getByText("start").click());
    act(() => screen.getByText("prev").click());
    expect(mockMovePrevious).toHaveBeenCalled();
  });

  it("moveTo(1) calls moveTo(1) on the driver instance", () => {
    render(<Harness />);
    act(() => screen.getByText("start").click());
    act(() => screen.getByText("moveTo").click());
    expect(mockMoveTo).toHaveBeenCalledWith(1);
  });
});

describe("useTour — lifecycle", () => {
  beforeEach(() => vi.clearAllMocks());

  it("destroys the driver instance on unmount", () => {
    const { unmount } = render(<Harness />);
    act(() => screen.getByText("start").click());
    unmount();
    expect(mockDestroy).toHaveBeenCalled();
  });

  it("does nothing when steps array is empty", () => {
    function EmptyHarness() {
      const { start, isActive } = useTour({ steps: [] });
      return (
        <div>
          <span data-testid="active">{String(isActive)}</span>
          <button onClick={() => start()}>start</button>
        </div>
      );
    }
    render(<EmptyHarness />);
    act(() => screen.getByText("start").click());
    expect(mockDrive).not.toHaveBeenCalled();
    expect(screen.getByTestId("active").textContent).toBe("false");
  });

  it("accepts a React ref as a step target without throwing", () => {
    function RefHarness() {
      const ref = createRef<HTMLDivElement>();
      const { start } = useTour({ steps: [{ target: ref, content: "Ref step" }] });
      return (
        <div>
          <div ref={ref} />
          <button onClick={() => start()}>start</button>
        </div>
      );
    }
    render(<RefHarness />);
    expect(() => act(() => screen.getByText("start").click())).not.toThrow();
  });

  it("re-starting an active tour destroys the previous instance first", () => {
    render(<Harness />);
    act(() => screen.getByText("start").click());
    act(() => screen.getByText("start").click());
    expect(mockDestroy).toHaveBeenCalledOnce();
    expect(mockDrive).toHaveBeenCalledTimes(2);
  });
});

// ─── useTour with TourProvider ────────────────────────────────────────────────

describe("useTour with TourProvider", () => {
  beforeEach(() => vi.clearAllMocks());

  function ProviderHarness() {
    const ctx = React.useContext(TourContext);
    const { start, stop } = useTour({ steps: baseSteps });
    return (
      <div>
        <span data-testid="ctx">{ctx?.activeTourId ?? "none"}</span>
        <button onClick={() => start()}>start</button>
        <button onClick={stop}>stop</button>
      </div>
    );
  }

  it("sets activeTourId in context when tour starts", () => {
    render(
      <TourProvider>
        <ProviderHarness />
      </TourProvider>
    );
    expect(screen.getByTestId("ctx").textContent).toBe("none");
    act(() => screen.getByText("start").click());
    expect(screen.getByTestId("ctx").textContent).not.toBe("none");
  });

  it("clears activeTourId in context when tour stops", () => {
    render(
      <TourProvider>
        <ProviderHarness />
      </TourProvider>
    );
    act(() => screen.getByText("start").click());
    act(() => screen.getByText("stop").click());
    expect(screen.getByTestId("ctx").textContent).toBe("none");
  });

  it("works without a TourProvider (no context)", () => {
    render(<ProviderHarness />);
    expect(() => act(() => screen.getByText("start").click())).not.toThrow();
  });
});
