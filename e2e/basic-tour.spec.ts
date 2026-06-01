import { test, expect } from "@playwright/test";
import { expectPopover, clickNext, closeTour, expectTourClosed, expectProgress } from "./helpers";

test.describe("basic tour", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/examples");
    // Ensure the Basic tab is active (default)
    await page.getByRole("button", { name: "Basic" }).click();
  });

  test("tour starts when button is clicked", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start tour" }).first().click();
    await expectPopover(page, "Navigation");
  });

  test("shows step 1 of 4 on open", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start tour" }).first().click();
    await expectProgress(page, 1, 4);
  });

  test("advances through all steps with Next", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start tour" }).first().click();
    await expectPopover(page, "Navigation");

    await clickNext(page);
    await expectPopover(page, "Save button");

    await clickNext(page);
    await expectPopover(page, "Stats section");

    await clickNext(page);
    await expectPopover(page, "You're all set");
  });

  test("last step shows Done button and closes on click", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start tour" }).first().click();
    // Skip to last step
    for (let i = 0; i < 3; i++) await clickNext(page);
    await expectPopover(page, "You're all set");
    await closeTour(page);
    await expectTourClosed(page);
  });

  test("Escape key closes the tour", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start tour" }).first().click();
    await expectPopover(page, "Navigation");
    await page.keyboard.press("Escape");
    await expectTourClosed(page);
  });

  test("Jump to step 3 starts from correct step", async ({ page }) => {
    await page.getByRole("button", { name: "Jump to step 3" }).click();
    await expectPopover(page, "Stats section");
    await expectProgress(page, 3, 4);
  });

  test("programmatic tab — next/prev/moveTo/stop controls work", async ({ page }) => {
    await page.getByRole("button", { name: "Programmatic" }).click();
    await page.getByRole("button", { name: "▶ Start" }).click();
    await expectPopover(page, "Step 1 of 4");

    // driver.js's SVG overlay covers the entire viewport except the cutout
    // around the active element, so the control buttons are intentionally
    // behind the overlay. dispatchEvent is correct here — it tests the
    // programmatic API as it would be called from code (not UI interaction,
    // which the overlay is designed to block).
    // Use getByRole with exact names to avoid matching the sidebar nav item
    // whose description text also contains "prev()".
    await page.getByRole("button", { name: "next() →", exact: true }).dispatchEvent("click");
    await expectPopover(page, "Step 2 of 4");

    await page.getByRole("button", { name: "← prev()", exact: true }).dispatchEvent("click");
    await expectPopover(page, "Step 1 of 4");

    await page.getByRole("button", { name: "next() →", exact: true }).dispatchEvent("click");
    await page.getByRole("button", { name: "moveTo(0)", exact: true }).dispatchEvent("click");
    await expectPopover(page, "Step 1 of 4");

    await page.getByRole("button", { name: "stop()", exact: true }).dispatchEvent("click");
    await expectTourClosed(page);
  });
});
