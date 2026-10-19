import { test, expect } from "@playwright/test";

test.describe("public marketing", () => {
  test("homepage loads with brand and CTAs", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(
      page.getByRole("link", { name: /start free trial/i }).first()
    ).toBeVisible();
  });

  test("pricing page shows plans", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.getByText(/starter/i).first()).toBeVisible();
    await expect(page.getByText(/professional/i).first()).toBeVisible();
  });

  test("register page has form", async ({ page }) => {
    await page.goto("/register");
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i).first()).toBeVisible();
  });
});
