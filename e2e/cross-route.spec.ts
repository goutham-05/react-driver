import { test, expect } from "@playwright/test";
import { expectPopover, clickNext, expectTourClosed } from "./helpers";

test.describe("cross-route shopping tour", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/examples/shopping");
  });

  test("tour starts on products page", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start shopping tour" }).click();
    await expectPopover(page, "Step 1");
    await expect(page).toHaveURL(/\/examples\/shopping$/);
  });

  test("Next on step 2 navigates to /cart and continues tour", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start shopping tour" }).click();
    // Step 1 — product card
    await expectPopover(page, "Step 1");
    await clickNext(page);
    // Step 2 — add to cart button
    await expectPopover(page, "Step 2");
    await clickNext(page);
    // Library waits for #cart-item to mount, then driver.js highlights it
    await expect(page).toHaveURL(/\/cart/, { timeout: 8000 });
    await expectPopover(page, "Step 3");
  });

  test("continues through cart and reaches checkout", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start shopping tour" }).click();
    // Products (steps 1-2)
    await expectPopover(page, "Step 1");
    await clickNext(page);
    await expectPopover(page, "Step 2");
    await clickNext(page);

    // Cart (steps 3-5)
    await expect(page).toHaveURL(/\/cart/, { timeout: 8000 });
    await expectPopover(page, "Step 3");
    await clickNext(page);
    await expectPopover(page, "Step 4");
    await clickNext(page);
    await expectPopover(page, "Step 5");
    await clickNext(page);

    // Checkout
    await expect(page).toHaveURL(/\/checkout/, { timeout: 8000 });
    await expectPopover(page, "Step 6");
  });

  test("completes full 8-step tour", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start shopping tour" }).click();

    // Walk all 8 steps — last 3 are on checkout
    for (let i = 0; i < 7; i++) {
      await page.locator(".driver-popover-next-btn").click();
      await page.locator("#driver-popover-content").waitFor({ state: "visible", timeout: 8000 });
    }

    // Step 8 — Done
    await expectPopover(page, "Step 8");
    await page.locator(".driver-popover-next-btn").click();
    await expectTourClosed(page);
  });

  test("Back on step 3 (cart) navigates back to products", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start shopping tour" }).click();
    await page.locator(".driver-popover-next-btn").click(); // step 2
    await page.locator(".driver-popover-next-btn").click(); // → cart, step 3
    await expect(page).toHaveURL(/\/cart/, { timeout: 8000 });

    // Back from step 3
    await page.locator(".driver-popover-prev-btn").click();
    await expect(page).toHaveURL(/\/examples\/shopping$/, { timeout: 8000 });
    await expectPopover(page, "Step 2");
  });
});
