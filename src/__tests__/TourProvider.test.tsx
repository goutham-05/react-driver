import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { TourProvider } from "../TourProvider";
import { useTourContext } from "../TourContext";

function ContextReader() {
  const ctx = useTourContext();
  return (
    <div>
      <span data-testid="active">{ctx?.activeTourId ?? "none"}</span>
    </div>
  );
}

describe("TourProvider", () => {
  it("renders children", () => {
    render(
      <TourProvider>
        <span data-testid="child">hello</span>
      </TourProvider>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("provides null activeTourId by default", () => {
    render(
      <TourProvider>
        <ContextReader />
      </TourProvider>
    );
    expect(screen.getByTestId("active").textContent).toBe("none");
  });

  it("returns null context when used outside TourProvider", () => {
    render(<ContextReader />);
    expect(screen.getByTestId("active").textContent).toBe("none");
  });
});
