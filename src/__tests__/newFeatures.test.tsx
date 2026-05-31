import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { TourProvider } from "../TourProvider";
import { TourContext } from "../TourContext";
import { useTour } from "../useTour";
import { useRegisterTour, useTourControls } from "../useRegisterTour";
import { clearTourHistory } from "../persistence";

// ── Mock driver.js ────────────────────────────────────────────────────────────
// vi.mock is hoisted — declare shared refs with vi.hoisted so they're available.

const {
  mockDrive, mockDestroy, mockMoveNext, mockMovePrev,
  mockIsLastStep, mockIsFirstStep, mockGetActiveIndex,
  mockDriverInstance, driverFactoryMock,
} = vi.hoisted(() => {
  const mockDrive           = vi.fn();
  const mockDestroy         = vi.fn();
  const mockMoveNext        = vi.fn();
  const mockMovePrev        = vi.fn();
  const mockIsLastStep      = vi.fn(() => false);
  const mockIsFirstStep     = vi.fn(() => false);
  const mockGetActiveIndex  = vi.fn(() => 0);
  const mockDriverInstance  = {
    drive: mockDrive, destroy: mockDestroy,
    moveNext: mockMoveNext, movePrevious: mockMovePrev,
    isLastStep: mockIsLastStep, isFirstStep: mockIsFirstStep,
    getActiveIndex: mockGetActiveIndex, moveTo: vi.fn(),
  };
  const driverFactoryMock = vi.fn(() => mockDriverInstance);
  return {
    mockDrive, mockDestroy, mockMoveNext, mockMovePrev,
    mockIsLastStep, mockIsFirstStep, mockGetActiveIndex,
    mockDriverInstance, driverFactoryMock,
  };
});

vi.mock("driver.js", () => ({ driver: driverFactoryMock }));

// ── Helpers ───────────────────────────────────────────────────────────────────

const baseSteps = [
  { target: "#a", content: "Step A" },
  { target: "#b", content: "Step B" },
];

beforeEach(() => {
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});

// ─────────────────────────────────────────────────────────────────────────────
// Conditional steps — visibleWhen
// ─────────────────────────────────────────────────────────────────────────────

describe("visibleWhen — conditional steps", () => {
  it("filters out steps where visibleWhen returns false", () => {
    function Harness() {
      const { start } = useTour({
        steps: [
          { target: "#a", content: "Always visible" },
          { target: "#b", content: "Conditionally hidden", visibleWhen: () => false },
          { target: "#c", content: "Always visible" },
        ],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const calledConfig = driverFactoryMock.mock.calls[0][0];
    expect(calledConfig.steps).toHaveLength(2);
    expect(calledConfig.steps[0].element).toBe("#a");
    expect(calledConfig.steps[1].element).toBe("#c");
  });

  it("includes steps where visibleWhen returns true", () => {
    function Harness() {
      const { start } = useTour({
        steps: [
          { target: "#a", content: "A", visibleWhen: () => true },
          { target: "#b", content: "B", visibleWhen: () => true },
        ],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const calledConfig = driverFactoryMock.mock.calls[0][0];
    expect(calledConfig.steps).toHaveLength(2);
  });

  it("reflects filtered count in totalSteps", () => {
    function Harness() {
      const { start, totalSteps } = useTour({
        steps: [
          { target: "#a", content: "A" },
          { target: "#b", content: "B", visibleWhen: () => false },
          { target: "#c", content: "C" },
        ],
      });
      return (
        <div>
          <span data-testid="total">{totalSteps}</span>
          <button onClick={() => start()}>start</button>
        </div>
      );
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());
    expect(screen.getByTestId("total").textContent).toBe("2");
  });

  it("re-evaluates visibleWhen on each start() call", () => {
    let show = false;
    function Harness() {
      const { start } = useTour({
        steps: [
          { target: "#a", content: "A" },
          { target: "#b", content: "B", visibleWhen: () => show },
        ],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);

    // First start: step B hidden
    act(() => screen.getByText("start").click());
    expect(driverFactoryMock.mock.calls[0][0].steps).toHaveLength(1);

    // Stop then re-start with flag flipped
    show = true;
    act(() => screen.getByText("start").click());
    expect(driverFactoryMock.mock.calls[1][0].steps).toHaveLength(2);
  });

  it("does nothing when all steps are filtered out", () => {
    function Harness() {
      const { start, isActive } = useTour({
        steps: [{ target: "#a", content: "A", visibleWhen: () => false }],
      });
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
});

// ─────────────────────────────────────────────────────────────────────────────
// Tour persistence — id + persist
// ─────────────────────────────────────────────────────────────────────────────

describe("tour persistence", () => {
  it("starts normally when persist is not set", () => {
    function Harness() {
      const { start } = useTour({ steps: baseSteps });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());
    expect(mockDrive).toHaveBeenCalled();
  });

  it("starts on first run when persist is true and tour unseen", () => {
    function Harness() {
      const { start } = useTour({ id: "p-tour", persist: true, steps: baseSteps });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());
    expect(mockDrive).toHaveBeenCalled();
  });

  it("skips start() if tour was already completed (localStorage)", () => {
    localStorage.setItem("react-driver:seen-tour", String(Date.now()));
    function Harness() {
      const { start, isActive } = useTour({ id: "seen-tour", persist: true, steps: baseSteps });
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

  it("skips start() if tour was already completed (sessionStorage)", () => {
    sessionStorage.setItem("react-driver:session-tour", String(Date.now()));
    function Harness() {
      const { start } = useTour({ id: "session-tour", persist: "session", steps: baseSteps });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());
    expect(mockDrive).not.toHaveBeenCalled();
  });

  it("marks tour as seen in localStorage when onDestroyStarted fires on last step", () => {
    mockIsLastStep.mockReturnValueOnce(true);
    function Harness() {
      const { start } = useTour({ id: "finish-tour", persist: true, steps: baseSteps });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    act(() => cfg.onDestroyStarted(undefined, undefined, { driver: mockDriverInstance }));

    expect(localStorage.getItem("react-driver:finish-tour")).not.toBeNull();
  });

  it("does NOT mark tour seen when skipped (not last step)", () => {
    mockIsLastStep.mockReturnValueOnce(false);
    function Harness() {
      const { start } = useTour({ id: "skip-tour", persist: true, steps: baseSteps });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const cfg = driverFactoryMock.mock.calls[0][0];
    act(() => cfg.onDestroyStarted(undefined, undefined, { driver: mockDriverInstance }));

    expect(localStorage.getItem("react-driver:skip-tour")).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// JSX content — ReactNode in title / content
// ─────────────────────────────────────────────────────────────────────────────

describe("JSX content", () => {
  it("passes string content directly to driver.js as description", () => {
    function Harness() {
      const { start } = useTour({
        steps: [{ target: "#a", title: "Hello", content: "Plain string" }],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const step = driverFactoryMock.mock.calls[0][0].steps[0];
    expect(step.popover.description).toBe("Plain string");
    expect(step.popover.title).toBe("Hello");
    expect(step.popover.onPopoverRender).toBeUndefined();
  });

  it("sets onPopoverRender when content is a ReactNode", () => {
    const jsxContent = React.createElement("strong", null, "Rich content");
    function Harness() {
      const { start } = useTour({
        steps: [{ target: "#a", content: jsxContent }],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const step = driverFactoryMock.mock.calls[0][0].steps[0];
    expect(typeof step.popover.onPopoverRender).toBe("function");
    // description placeholder is a space (non-empty to avoid driver.js hiding element)
    expect(step.popover.description).toBe(" ");
  });

  it("sets onPopoverRender when title is a ReactNode", () => {
    const jsxTitle = React.createElement("em", null, "Fancy title");
    function Harness() {
      const { start } = useTour({
        steps: [{ target: "#a", title: jsxTitle, content: "String content" }],
      });
      return <button onClick={() => start()}>start</button>;
    }
    render(<Harness />);
    act(() => screen.getByText("start").click());

    const step = driverFactoryMock.mock.calls[0][0].steps[0];
    expect(typeof step.popover.onPopoverRender).toBe("function");
    // String content passes through directly
    expect(step.popover.description).toBe("String content");
    // Title placeholder
    expect(step.popover.title).toBe(" ");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// Named tour registry — useRegisterTour + useTourControls
// ─────────────────────────────────────────────────────────────────────────────

describe("useRegisterTour + useTourControls", () => {
  function Registrar({ id }: { id: string }) {
    useRegisterTour(id, { steps: baseSteps });
    return null;
  }

  function Consumer({ id }: { id: string }) {
    const controls = useTourControls(id);
    return (
      <div>
        <span data-testid="found">{controls ? "yes" : "no"}</span>
        <button onClick={() => controls?.start()}>start-via-registry</button>
      </div>
    );
  }

  it("useTourControls returns null without TourProvider", () => {
    render(<Consumer id="my-tour" />);
    expect(screen.getByTestId("found").textContent).toBe("no");
  });

  it("useTourControls returns controls after useRegisterTour inside TourProvider", () => {
    render(
      <TourProvider>
        <Registrar id="my-tour" />
        <Consumer id="my-tour" />
      </TourProvider>
    );
    expect(screen.getByTestId("found").textContent).toBe("yes");
  });

  it("starting via useTourControls calls driver.drive()", () => {
    render(
      <TourProvider>
        <Registrar id="reg-tour" />
        <Consumer id="reg-tour" />
      </TourProvider>
    );
    act(() => screen.getByText("start-via-registry").click());
    expect(mockDrive).toHaveBeenCalled();
  });

  it("useTourControls returns null for an unregistered id", () => {
    render(
      <TourProvider>
        <Registrar id="tour-x" />
        <Consumer id="tour-y" />
      </TourProvider>
    );
    expect(screen.getByTestId("found").textContent).toBe("no");
  });

  it("registry is scoped to TourProvider — different providers don't share", () => {
    render(
      <div>
        <TourProvider>
          <Registrar id="shared-tour" />
        </TourProvider>
        <TourProvider>
          <Consumer id="shared-tour" />
        </TourProvider>
      </div>
    );
    expect(screen.getByTestId("found").textContent).toBe("no");
  });
});
