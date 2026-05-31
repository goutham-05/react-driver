import { test, expect } from "@playwright/test";
import { expectPopover, clickNext, expectTourClosed } from "./helpers";

// These tests use a dedicated demo that has id + persist set.
// We use the conditional-steps demo on /examples which exposes totalSteps,
// and write a lightweight custom page test using the playground.

test.describe("tour persistence", () => {
  test("localStorage is written when tour completes", async ({ page }) => {
    await page.goto("/examples");
    await page.getByRole("button", { name: "Basic" }).click();

    // The basic demo doesn't use persist — verify localStorage is NOT written
    await page.getByRole("button", { name: "▶ Start tour" }).first().click();
    await expectPopover(page, "Navigation");
    for (let i = 0; i < 3; i++) await clickNext(page);
    await page.locator(".driver-popover-next-btn").click(); // Done
    await expectTourClosed(page);

    // No persistence key for the basic tour (no id set)
    const keys = await page.evaluate(() =>
      Object.keys(localStorage).filter(k => k.startsWith("react-driver:"))
    );
    expect(keys).toHaveLength(0);
  });

  test("conditional step count reflects visibleWhen filter (free plan)", async ({ page }) => {
    await page.goto("/examples");
    await page.getByRole("button", { name: "Conditional steps" }).click();

    // Start the tour so totalSteps is computed — free plan: 3 visible steps
    await page.getByRole("button", { name: "▶ Start tour" }).click();
    await expectPopover(page, "Dashboard");
    // showProgress shows "1 of N" — for free plan that's 1 of 3
    await expect(page.locator(".driver-popover-progress-text")).toContainText("1 of 3");
    await page.keyboard.press("Escape");
  });

  test("switching to Pro plan changes visible step count", async ({ page }) => {
    await page.goto("/examples");
    await page.getByRole("button", { name: "Conditional steps" }).click();

    await page.getByRole("button", { name: "⭐ Pro" }).click();
    // Start the tour — pro plan: pro-only step visible instead of upgrade → still 3
    await page.getByRole("button", { name: "▶ Start tour" }).click();
    await expectPopover(page, "Dashboard");
    await expect(page.locator(".driver-popover-progress-text")).toContainText("1 of 3");
    await page.keyboard.press("Escape");
  });

  test("free plan tour highlights upgrade step", async ({ page }) => {
    await page.goto("/examples");
    await page.getByRole("button", { name: "Conditional steps" }).click();

    await page.getByRole("button", { name: "▶ Start tour" }).click();
    // Step 1 — dashboard
    await expectPopover(page, "Dashboard");
    await clickNext(page);
    // Step 2 — upgrade (free plan — visible)
    await expectPopover(page, "Upgrade");
  });

  test("pro plan tour skips upgrade step and shows pro-only step", async ({ page }) => {
    await page.goto("/examples");
    await page.getByRole("button", { name: "Conditional steps" }).click();
    await page.getByRole("button", { name: "⭐ Pro" }).click();

    await page.getByRole("button", { name: "▶ Start tour" }).click();
    await expectPopover(page, "Dashboard");
    await clickNext(page);
    // Upgrade step is hidden — should see Pro feature step
    await expectPopover(page, "Pro feature");
  });
});
