import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TourProvider } from "../TourProvider";
import { useTour } from "../useTour";
import { TourChecklist } from "../TourChecklist";
import { createMockTour } from "../testing";
import { skipTour, hasSeenTour, clearTourHistory } from "../persistence";

// ── Mock driver.js ─────────────────────────────────────────────────────────

const {
  mockDrive, mockDestroy, mockIsLastStep, mockGetActiveIndex,
  mockDriverInstance, driverFactoryMock,
} = vi.hoisted(() => {
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
  return {
    mockDrive, mockDestroy, mockIsLastStep, mockGetActiveIndex,
    mockDriverInstance, driverFactoryMock: vi.fn(() => mockDriverInstance),
  };
});

vi.mock("driver.js", () => ({ driver: driverFactoryMock }));

const baseSteps = [
  { target: "#a", title: "Step A", content: "Content A" },
  { target: "#b", title: "Step B", content: "Content B" },
  { target: "#c", title: "Step C", content: "Content C" },
];

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
// skipTour utility
// ─────────────────────────────────────────────────────────────────────────────

describe("skipTour()", () => {
  it("marks tour as seen in localStorage", () => {
    skipTour("skipped-tour");
    expect(hasSeenTour("skipped-tour")).toBe(true);
  });

  it("marks tour as seen in sessionStorage when persist='session'", () => {
    skipTour("skipped-session", "session");
    expect(hasSeenTour("skipped-session", "session")).toBe(true);
  });

  it("prevents the tour from starting after skipTour", () => {
    skipTour("blocked-tour");
    function Harness() {
      const { start, isActive } = useTour({ id: "blocked-tour", persist: true, steps: baseSteps });
      return (
        <div>
          <span data-testid="active">{String(isActive)}</span>
          <button onClick={() => start()}>start</button>
        </div>
      );
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());
    expect(mockDrive).not.toHaveBeenCalled();
    expect(screen.getByTestId("active").textContent).toBe("false");
  });

  it("can be reset with clearTourHistory", () => {
    skipTour("resettable");
    clearTourHistory("resettable");
    expect(hasSeenTour("resettable")).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// onBeforeStart guard
// ─────────────────────────────────────────────────────────────────────────────

describe("onBeforeStart", () => {
  it("starts the tour when onBeforeStart returns true", async () => {
    function Harness() {
      const { start } = useTour({ steps: baseSteps, onBeforeStart: () => true });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    await act(async () => {
      screen.getByText("start").click();
      await new Promise(r => setTimeout(r, 20));
    });
    expect(mockDrive).toHaveBeenCalled();
  });

  it("blocks the tour when onBeforeStart returns false", async () => {
    function Harness() {
      const { start } = useTour({ steps: baseSteps, onBeforeStart: () => false });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    await act(async () => {
      screen.getByText("start").click();
      await new Promise(r => setTimeout(r, 20));
    });
    expect(mockDrive).not.toHaveBeenCalled();
  });

  it("supports async onBeforeStart", async () => {
    function Harness() {
      const { start } = useTour({
        steps: baseSteps,
        onBeforeStart: () => Promise.resolve(false),
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    await act(async () => {
      screen.getByText("start").click();
      await new Promise(r => setTimeout(r, 30));
    });
    expect(mockDrive).not.toHaveBeenCalled();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// debug mode
// ─────────────────────────────────────────────────────────────────────────────

describe("debug mode", () => {
  it("logs step entry when debug:true", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    function Harness() {
      const { start } = useTour({ steps: baseSteps, debug: true });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    act(() => cfg.onHighlighted(undefined, undefined, { state: { activeIndex: 0 }, driver: mockDriverInstance }));

    expect(spy).toHaveBeenCalledWith(
      expect.stringContaining("[react-driver]"),
      expect.anything()
    );
    spy.mockRestore();
  });

  it("does not log when debug is not set", () => {
    const spy = vi.spyOn(console, "log").mockImplementation(() => {});
    function Harness() {
      const { start } = useTour({ steps: baseSteps }); // no debug
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    act(() => cfg.onHighlighted(undefined, undefined, { state: { activeIndex: 0 }, driver: mockDriverInstance }));

    expect(spy).not.toHaveBeenCalledWith(expect.stringContaining("[react-driver]"), expect.anything(), expect.anything());
    spy.mockRestore();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// renderPopover
// ─────────────────────────────────────────────────────────────────────────────

describe("renderPopover", () => {
  // Ensure the fake popover element is always cleaned up even if the test throws
  let popoverEl: HTMLDivElement;
  beforeEach(() => {
    popoverEl = document.createElement("div");
    popoverEl.id = "driver-popover-content";
    document.body.appendChild(popoverEl);
  });
  afterEach(() => { popoverEl?.remove(); });

  it("renders the custom component into the popover when renderPopover is set", () => {
    const CustomPopover = vi.fn(({ step, next, stop, isLast }: any) => (
      <div data-testid="custom-popover">
        <span>{String(step.title)}</span>
        <button onClick={next}>{isLast ? "Finish" : "Next"}</button>
        <button onClick={stop}>Close</button>
      </div>
    ));

    function Harness() {
      const { start } = useTour({ steps: baseSteps, renderPopover: CustomPopover });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    // renderPopover now uses onPopoverRender (fires before animation, zero flash)
    // instead of onHighlighted (fired after 400ms animation = flash)
    act(() => cfg.onPopoverRender(
      { wrapper: popoverEl, title: document.createElement("div"), description: document.createElement("div") },
      { state: { activeIndex: 0 }, driver: mockDriverInstance }
    ));

    expect(CustomPopover).toHaveBeenCalled();
    const receivedProps = CustomPopover.mock.calls[0][0];
    expect(receivedProps.stepIndex).toBe(0);
    expect(receivedProps.step).toBeDefined();
    expect(typeof receivedProps.next).toBe("function");
    expect(typeof receivedProps.stop).toBe("function");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// TourChecklist component
// ─────────────────────────────────────────────────────────────────────────────

describe("TourChecklist", () => {
  it("renders all steps with titles", () => {
    render(
      <TourChecklist
        steps={baseSteps}
        currentStep={0}
        isActive={true}
        onJumpTo={vi.fn()}
      />
    );
    // Use selector: "span" to target the label span, not the containing button
    expect(screen.getByText("Step A", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Step B", { selector: "span" })).toBeInTheDocument();
    expect(screen.getByText("Step C", { selector: "span" })).toBeInTheDocument();
  });

  it("shows 'Step N' label when title is not a string", () => {
    const stepsNoTitle = [
      { content: "Content", title: undefined as any },
    ];
    render(
      <TourChecklist steps={stepsNoTitle} currentStep={0} isActive={true} onJumpTo={vi.fn()} />
    );
    expect(screen.getByText("Step 1")).toBeInTheDocument();
  });

  it("calls onJumpTo with the correct index on click", () => {
    const onJumpTo = vi.fn();
    render(
      <TourChecklist steps={baseSteps} currentStep={0} isActive={true} onJumpTo={onJumpTo} />
    );
    screen.getByText("Step B").click();
    expect(onJumpTo).toHaveBeenCalledWith(1);
  });

  it("does not call onJumpTo when tour is not active", () => {
    const onJumpTo = vi.fn();
    render(
      <TourChecklist steps={baseSteps} currentStep={0} isActive={false} onJumpTo={onJumpTo} />
    );
    screen.getByText("Step B").click();
    expect(onJumpTo).not.toHaveBeenCalled();
  });

  it("renders a custom title", () => {
    render(
      <TourChecklist steps={baseSteps} currentStep={0} isActive={false} onJumpTo={vi.fn()} title="Getting started" />
    );
    expect(screen.getByText("Getting started")).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// createMockTour
// ─────────────────────────────────────────────────────────────────────────────

describe("createMockTour", () => {
  it("returns an object with all TourControls fields", () => {
    const mock = createMockTour();
    expect(typeof mock.start).toBe("function");
    expect(typeof mock.stop).toBe("function");
    expect(typeof mock.restart).toBe("function");
    expect(typeof mock.next).toBe("function");
    expect(typeof mock.prev).toBe("function");
    expect(typeof mock.moveTo).toBe("function");
    expect(mock.isActive).toBe(false);
    expect(mock.currentStep).toBe(0);
    expect(mock.totalSteps).toBe(0);
  });

  it("applies overrides", () => {
    const mock = createMockTour({ isActive: true, currentStep: 2, totalSteps: 5 });
    expect(mock.isActive).toBe(true);
    expect(mock.currentStep).toBe(2);
    expect(mock.totalSteps).toBe(5);
  });

  it("override functions are callable", () => {
    const onStart = vi.fn();
    const mock = createMockTour({ start: onStart });
    mock.start(0);
    expect(onStart).toHaveBeenCalledWith(0);
  });
});
