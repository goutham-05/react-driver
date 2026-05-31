import { describe, it, expect, beforeEach } from "vitest";
import { hasSeenTour, markTourSeen, clearTourHistory } from "../persistence";

const KEY = "react-driver:test-tour";

describe("persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe("hasSeenTour", () => {
    it("returns false when tour has never been seen", () => {
      expect(hasSeenTour("test-tour")).toBe(false);
    });

    it("returns true after markTourSeen (localStorage)", () => {
      markTourSeen("test-tour", true);
      expect(hasSeenTour("test-tour", true)).toBe(true);
    });

    it("returns true after markTourSeen (sessionStorage)", () => {
      markTourSeen("test-tour", "session");
      expect(hasSeenTour("test-tour", "session")).toBe(true);
    });

    it("does not cross-contaminate storage types", () => {
      markTourSeen("test-tour", true); // localStorage
      expect(hasSeenTour("test-tour", "session")).toBe(false);
    });
  });

  describe("markTourSeen", () => {
    it("writes a JSON record with completedAt to localStorage", () => {
      const before = Date.now();
      markTourSeen("test-tour", true);
      const record = JSON.parse(localStorage.getItem(KEY)!);
      expect(record.completedAt).toBeGreaterThanOrEqual(before);
      expect(record.completedAt).toBeLessThanOrEqual(Date.now());
    });

    it("writes to sessionStorage when persist is 'session'", () => {
      markTourSeen("test-tour", "session");
      expect(sessionStorage.getItem(KEY)).not.toBeNull();
      expect(localStorage.getItem(KEY)).toBeNull();
    });
  });

  describe("clearTourHistory", () => {
    it("removes a specific tour", () => {
      markTourSeen("test-tour", true);
      clearTourHistory("test-tour");
      expect(hasSeenTour("test-tour")).toBe(false);
    });

    it("does not remove other tours when id is specified", () => {
      markTourSeen("tour-a", true);
      markTourSeen("tour-b", true);
      clearTourHistory("tour-a");
      expect(hasSeenTour("tour-a")).toBe(false);
      expect(hasSeenTour("tour-b")).toBe(true);
    });

    it("removes all tours when called without id", () => {
      markTourSeen("tour-a", true);
      markTourSeen("tour-b", true);
      markTourSeen("tour-c", "session");
      clearTourHistory();
      expect(hasSeenTour("tour-a")).toBe(false);
      expect(hasSeenTour("tour-b")).toBe(false);
      expect(hasSeenTour("tour-c", "session")).toBe(false);
    });

    it("is a no-op for a tour that was never seen", () => {
      expect(() => clearTourHistory("nonexistent")).not.toThrow();
    });
  });
});
