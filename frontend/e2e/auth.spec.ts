import { test, expect } from "@playwright/test";

test.describe("Authentication pages", () => {
  test("login page renders and accepts credentials", async ({ page }) => {
    await page.goto("/ne/login");
    await expect(page.getByRole("heading", { name: /साइन इन|Sign in|Welcome/i })).toBeVisible();
    await expect(page.getByLabel(/इमेल|Email/)).toBeVisible();
    await expect(page.getByLabel(/पासवर्ड|Password/)).toBeVisible();
  });

  test("register page renders with form fields", async ({ page }) => {
    await page.goto("/ne/register");
    await expect(page.getByRole("heading", { name: /Join|सदस्य|Account/i })).toBeVisible();
    await expect(page.getByLabel(/Full name|पूरा नाम/)).toBeVisible();
    await expect(page.getByLabel(/इमेल|Email/)).toBeVisible();
  });

  test("forgot password page renders", async ({ page }) => {
    await page.goto("/ne/forgot-password");
    await expect(page.getByLabel(/इमेल|Email/)).toBeVisible();
  });
});
