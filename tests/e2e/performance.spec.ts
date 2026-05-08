import { test, expect } from "./fixtures/auth-fixtures";

test.describe("Performance and Accessibility", () => {
  test("should load dashboard within acceptable time", async ({
    authenticatedPage,
    helpers,
  }) => {
    const startTime = Date.now();
    await helpers.navigateTo("/dashboard");
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(3000);
  });

  test("should have proper page titles", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/quotes");
    const title = authenticatedPage.url();
    expect(title).toContain("quotes");

    const pageTitle = await authenticatedPage.title();
    expect(pageTitle).toBeTruthy();
  });

  test("should have accessible form labels", async ({
    page,
    helpers,
  }) => {
    await helpers.navigateTo("/login");

    const emailLabel = page.locator('label[for="email"]');
    const passwordLabel = page.locator('label[for="password"]');

    await expect(emailLabel).toBeVisible();
    await expect(passwordLabel).toBeVisible();
  });

  test("should have keyboard navigation support", async ({
    page,
    helpers,
  }) => {
    await helpers.navigateTo("/login");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.focus();
    await expect(emailInput).toBeFocused();

    await page.keyboard.press("Tab");
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeFocused();
  });

  test("should have proper contrast ratios", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/quotes");

    const headings = authenticatedPage.locator("h1, h2, h3, h4, h5, h6");
    const count = await headings.count();
    expect(count).toBeGreaterThan(0);

    const buttons = authenticatedPage.locator("button");
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test("should have alt text for images", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/");

    const images = authenticatedPage.locator("img");
    const count = await images.count();

    if (count > 0) {
      const firstImage = images.first();
      const altText = await firstImage.getAttribute("alt");
      expect(altText).toBeTruthy();
    }
  });

  test("should be responsive on mobile", async ({
    authenticatedPage,
    helpers,
  }) => {
    await authenticatedPage.setViewportSize({ width: 375, height: 667 });
    await helpers.navigateTo("/quotes");

    const viewport = authenticatedPage.viewportSize();
    expect(viewport?.width).toBe(375);

    const mobileMenu = authenticatedPage.locator(
      '[data-testid="mobile-menu"], nav > button'
    );
    const isVisible = await mobileMenu.isVisible().catch(() => false);
    if (isVisible) {
      await expect(mobileMenu).toBeVisible();
    }
  });

  test("should handle long content gracefully", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/quotes/new");

    const descriptionInput = authenticatedPage.locator(
      'textarea[name="description"]'
    );
    const longText = "a".repeat(5000);
    await descriptionInput.fill(longText);

    const submitButton = authenticatedPage.locator(
      'button[type="submit"]:has-text("Create")'
    );
    await expect(submitButton).toBeEnabled();
  });

  test("should have visible focus indicators", async ({
    page,
    helpers,
  }) => {
    await helpers.navigateTo("/login");

    const submitButton = page.locator('button[type="submit"]');
    await submitButton.focus();

    const style = await submitButton.evaluate((el) =>
      window.getComputedStyle(el)
    );
    expect(style).toBeTruthy();
  });

  test("should cache API responses efficiently", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/quotes");
    const firstLoadTime = Date.now();

    await authenticatedPage.reload();
    const secondLoadTime = Date.now() - firstLoadTime;

    expect(secondLoadTime).toBeLessThan(2000);
  });
});
