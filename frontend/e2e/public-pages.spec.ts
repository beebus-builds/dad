import { test, expect } from "@playwright/test";

const PUBLIC_PAGES = [
  { path: "/", title: /श्रम जगरण|Shram Jagaran|Workers/i },
  { path: "/about", title: /बारेमा|About/i },
  { path: "/contact", title: /सम्पर्क|Contact/i },
  { path: "/news", title: /समाचार|News/i },
  { path: "/events", title: /कार्यक्रम|Events/i },
  { path: "/donate", title: /सहयोग|Donate/i },
  { path: "/membership", title: /सदस्यता|Membership/i },
  { path: "/legal", title: /कानुनी|Legal/i },
];

test.describe("Public pages load correctly", () => {
  for (const { path, title } of PUBLIC_PAGES) {
    test(`${path} loads with expected title`, async ({ page }) => {
      const resp = await page.goto(`/ne${path}`);
      expect(resp?.status()).toBeLessThan(400);
      await expect(page).toHaveTitle(title);
    });
  }
});

test.describe("Navigation works", () => {
  test("navigates between pages via header links", async ({ page }) => {
    await page.goto("/ne");
    await page.getByRole("link", { name: /समाचार|News/ }).first().click();
    await expect(page).toHaveURL(/\/ne\/news/);
    await expect(page.locator("h1")).not.toBeEmpty();
  });
});

test.describe("Search", () => {
  test("search form is accessible and accepts input", async ({ page }) => {
    await page.goto("/ne");
    const searchBtn = page.getByRole("button", { name: /खोज्नुहोस्|Search/ });
    await expect(searchBtn).toBeVisible();
    await searchBtn.click();
    const searchInput = page.getByPlaceholder(/खोज्नुहोस्|Search/);
    await expect(searchInput).toBeVisible();
    await searchInput.fill("श्रमिक");
    await searchInput.press("Enter");
    await expect(page).toHaveURL(/\/ne\/search/);
  });
});
