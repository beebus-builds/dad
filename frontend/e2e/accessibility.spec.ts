import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const PUBLIC_ROUTES = [
  "/ne", "/ne/about", "/ne/contact", "/ne/news",
  "/ne/events", "/ne/donate", "/ne/membership", "/ne/legal",
  "/ne/login", "/ne/register", "/ne/forgot-password",
];

test.describe("Accessibility (axe-core)", () => {
  for (const route of PUBLIC_ROUTES) {
    test(`${route} has no critical a11y violations`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations.filter((v) => v.impact === "critical" || v.impact === "serious")).toEqual([]);
    });
  }
});
