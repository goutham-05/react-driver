import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

/** Wait for driver.js popover to be visible and return its text content. */
export async function expectPopover(page: Page, title: string, timeout = 8000) {
  const popover = page.locator("#driver-popover-content");
  await expect(popover).toBeVisible({ timeout });
  await expect(page.locator(".driver-popover-title")).toContainText(title, { timeout });
}

/** Click the driver.js Next → button. */
export async function clickNext(page: Page) {
  await page.locator(".driver-popover-next-btn").click();
}

/**
 * Wait until the library's `onHighlighted` callback has fired for the given
 * element. The library sets `data-tour-step` on the active element inside
 * `onHighlighted` (which fires only after driver.js's 400ms animation), so
 * waiting for this attribute is a deterministic, timing-free signal that
 * `advanceOn` listeners have been registered and it is safe to click.
 */
export async function waitForHighlighted(page: Page, selector: string) {
  await page.locator(`${selector}[data-tour-step]`).waitFor({ timeout: 6000 });
}

/** Click the driver.js ← Back button. */
export async function clickBack(page: Page) {
  await page.locator(".driver-popover-prev-btn").click();
}

/** Click the driver.js Done / close button. */
export async function closeTour(page: Page) {
  // Try Done button first, fall back to × close
  const done  = page.locator(".driver-popover-next-btn");
  const close = page.locator(".driver-popover-close-btn");
  if (await done.isVisible()) await done.click();
  else await close.click();
}

/** Assert driver.js overlay is gone (tour ended). */
export async function expectTourClosed(page: Page) {
  await expect(page.locator("#driver-popover-content")).toBeHidden({ timeout: 4000 });
}

/** Assert the popover shows step N of total. */
export async function expectProgress(page: Page, current: number, total: number) {
  await expect(page.locator(".driver-popover-progress-text"))
    .toContainText(`${current} of ${total}`, { timeout: 4000 });
}
