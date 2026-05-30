import "@testing-library/jest-dom";

// driver.js accesses the DOM at runtime — stub the parts jsdom doesn't provide.
(globalThis as any).CSS = { escape: (s: string) => s };
