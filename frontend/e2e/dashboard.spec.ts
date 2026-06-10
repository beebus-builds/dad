import { test, expect } from "@playwright/test";

test.describe("Dashboard (authenticated)", () => {
  test("redirects to login when not authenticated", async ({ page }) => {
    await page.goto("/ne/dashboard");
    await expect(page).toHaveURL(/\/ne\/login/);
  });
});
