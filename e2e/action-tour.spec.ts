import { test, expect } from "@playwright/test";
import { expectPopover, clickNext, expectTourClosed, waitForHighlighted } from "./helpers";

test.describe("action-driven auth tour", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/examples/auth");
  });

  test("tour starts and highlights email field", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start tour" }).click();
    // Step 1 — floating welcome
    await expectPopover(page, "Welcome");
    await clickNext(page);
    // Step 2 — email field
    await expectPopover(page, "Your email address");
    await expect(page.locator("#auth-email")).toBeVisible();
  });

  test("walking through pre-auth steps reaches avatar", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start tour" }).click();
    // Welcome → email → password → submit button
    for (let i = 0; i < 3; i++) await clickNext(page);
    await expectPopover(page, "Create your account");
    await expect(page.locator("#auth-submit")).toBeVisible();
  });

  test("Next on submit step triggers login and shows avatar", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start tour" }).click();
    for (let i = 0; i < 3; i++) await clickNext(page);
    await expectPopover(page, "Create your account");

    // beforeNext: setIsLoggedIn(true) — authenticated UI mounts
    await clickNext(page);
    await expect(page.locator("#user-avatar")).toBeVisible({ timeout: 6000 });
    await expectPopover(page, "You're in");
  });

  test("clicking Edit profile advances tour to profile panel", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start tour" }).click();
    // Advance to step 6 (Edit profile item in dropdown)
    for (let i = 0; i < 5; i++) await clickNext(page);
    // Wait for onHighlighted to fire (registers the advanceOn listener)
    await waitForHighlighted(page, "#menu-edit-profile");

    // advanceOn — clicking the item advances the tour AND opens the panel
    await page.locator("#menu-edit-profile").click();
    await expect(page.locator("#panel-profile")).toBeVisible({ timeout: 8000 });
    await expectPopover(page, "Profile settings");
  });

  test("Next on Edit profile step also opens panel (no advanceOn required)", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start tour" }).click();
    for (let i = 0; i < 5; i++) await clickNext(page);
    await expectPopover(page, "Edit profile");

    // beforeNext path: user clicks Next instead of the menu item
    await clickNext(page);
    await expect(page.locator("#panel-profile")).toBeVisible({ timeout: 6000 });
    await expectPopover(page, "Profile settings");
  });

  test("clicking Notifications advances from step 8", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start tour" }).click();
    // Advance to step 8 (Notifications item in dropdown)
    for (let i = 0; i < 7; i++) await clickNext(page);
    await waitForHighlighted(page, "#menu-notifications");

    await page.locator("#menu-notifications").click();
    await expect(page.locator("#panel-notifications")).toBeVisible({ timeout: 8000 });
    await expectPopover(page, "Notification preferences");
  });

  test("tour completes and overlay is removed", async ({ page }) => {
    await page.getByRole("button", { name: "▶ Start tour" }).click();
    // Walk all steps
    for (let i = 0; i < 9; i++) {
      await clickNext(page);
      await page.locator("#driver-popover-content").waitFor({ state: "visible", timeout: 8000 });
    }
    // Final floating step
    await expectPopover(page, "All done");
    await page.locator(".driver-popover-next-btn").click();
    await expectTourClosed(page);
  });
});
