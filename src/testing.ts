import type { TourControls } from "./types";

/**
 * Creates a stub `TourControls` object for use in unit tests. All methods are
 * no-ops by default; override any with your own implementations or spies.
 *
 * @example
 * // vitest / jest
 * import { createMockTour } from "@oqlet/react-driver/testing";
 * import { vi } from "vitest";
 *
 * const mockTour = createMockTour({ isActive: true });
 * vi.mock("@oqlet/react-driver", () => ({
 *   useTour: () => mockTour,
 * }));
 *
 * // Assert the start button was wired up correctly
 * expect(mockTour.start).toHaveBeenCalledWith(0);
 */
export function createMockTour(overrides?: Partial<TourControls>): TourControls {
  return {
    start:       () => {},
    stop:        () => {},
    restart:     () => {},
    next:        () => {},
    prev:        () => {},
    moveTo:      () => {},
    onComplete:  () => () => {},
    isActive:    false,
    currentStep: 0,
    totalSteps:  0,
    ...overrides,
  };
}
