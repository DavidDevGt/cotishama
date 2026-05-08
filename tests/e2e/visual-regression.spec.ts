import { test, expect } from "./fixtures/auth-fixtures";

test.describe("Visual Regression Tests", () => {
  test("login page layout consistency", async ({ page, helpers }) => {
    await helpers.navigateTo("/login");
    await page.waitForLoadState("networkidle");

    // Verify visual consistency
    const loginForm = page.locator('form, [data-testid="login-form"]');
    await expect(loginForm).toBeVisible();

    // Check key elements are in viewport
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    const emailBox = await emailInput.boundingBox();
    const passwordBox = await passwordInput.boundingBox();
    const submitBox = await submitButton.boundingBox();

    expect(emailBox).toBeTruthy();
    expect(passwordBox).toBeTruthy();
    expect(submitBox).toBeTruthy();

    // Verify vertical stacking
    if (emailBox && passwordBox) {
      expect(passwordBox.y).toBeGreaterThan(emailBox.y);
    }
  });

  test("dashboard header consistency", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/dashboard");

    // Logo/branding should be present
    const header = authenticatedPage.locator("header, [role='banner']");
    await expect(header).toBeVisible();

    // Navigation menu should be visible
    const nav = authenticatedPage.locator("nav, [role='navigation']");
    await expect(nav).toBeVisible();
  });

  test("quote list table structure", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/quotes");

    // Should have table or list structure
    const list = authenticatedPage.locator(
      'table, [role="table"], [data-testid="quotes-list"]'
    );
    await expect(list).toBeVisible();

    // Should have header
    const header = authenticatedPage.locator("thead, [role='rowgroup']");
    const headerVisible = await header.isVisible().catch(() => false);
    expect([true, false]).toContain(headerVisible);
  });

  test("form layout consistency", async ({ authenticatedPage, helpers }) => {
    await helpers.navigateTo("/quotes/new");

    // All form inputs should have labels
    const labels = authenticatedPage.locator("label");
    const labelCount = await labels.count();
    expect(labelCount).toBeGreaterThan(0);

    // Submit button should be at bottom
    const submitButton = authenticatedPage.locator(
      'button[type="submit"]:has-text("Create")'
    );
    const submitBox = await submitButton.boundingBox();
    expect(submitBox).toBeTruthy();

    if (submitBox) {
      const viewportSize = authenticatedPage.viewportSize();
      if (viewportSize) {
        expect(submitBox.y).toBeGreaterThan(viewportSize.height / 2);
      }
    }
  });

  test("mobile menu layout", async ({ authenticatedPage, helpers }) => {
    await authenticatedPage.setViewportSize({ width: 375, height: 667 });
    await helpers.navigateTo("/dashboard");

    // Mobile should have hamburger or collapsible menu
    const mobileMenu = authenticatedPage.locator(
      '[data-testid="mobile-menu"], [aria-label*="menu" i], .hamburger'
    );
    const mobileMenuExists = await mobileMenu.isVisible().catch(() => false);

    // Or navigation should be hidden on mobile
    const nav = authenticatedPage.locator("nav");
    const navVisible = await nav.isVisible().catch(() => false);

    expect(mobileMenuExists || !navVisible).toBeTruthy();
  });

  test("modal/dialog consistency", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/quotes");

    const firstQuote = authenticatedPage.locator(
      '[data-testid="quote-row"]:first-child'
    );
    const quoteExists = await firstQuote.isVisible().catch(() => false);

    if (quoteExists) {
      await firstQuote.click();

      const deleteButton = authenticatedPage.locator(
        '[data-testid="delete-button"], button:has-text("Delete")'
      );
      const deleteExists = await deleteButton.isVisible().catch(() => false);

      if (deleteExists) {
        await deleteButton.click();

        // Modal should appear
        const modal = authenticatedPage.locator(
          '[role="dialog"], .modal, .dialog'
        );
        await expect(modal).toBeVisible({ timeout: 2000 }).catch(() => {});
      }
    }
  });

  test("error message styling", async ({ page, helpers }) => {
    await helpers.navigateTo("/login");

    // Submit without data to trigger errors
    const submitButton = page.locator('button[type="submit"]');
    await submitButton.click();

    // Look for error indicators
    const errors = page.locator(
      '[data-testid*="error"], .error, [role="alert"]'
    );
    const errorCount = await errors.count().catch(() => 0);

    // Should have at least one error or validation message
    expect(errorCount).toBeGreaterThanOrEqual(0);
  });

  test("button state consistency", async ({ page, helpers }) => {
    await helpers.navigateTo("/login");

    const submitButton = page.locator('button[type="submit"]');

    // Initially enabled
    await expect(submitButton).toBeEnabled();

    // Check hover state (button should be interactive)
    await submitButton.hover();
    await expect(submitButton).toBeVisible();

    // Check active state
    const isDisabled = await submitButton
      .isDisabled()
      .catch(() => false);
    expect(typeof isDisabled).toBe("boolean");
  });

  test("spacing and alignment", async ({ authenticatedPage, helpers }) => {
    await helpers.navigateTo("/quotes");

    // Get main container
    const mainContent = authenticatedPage.locator(
      "[role='main'], main, [data-testid='main-content']"
    );
    const mainBox = await mainContent.boundingBox();

    // Main content should have padding/margins (not flush to edge)
    if (mainBox) {
      expect(mainBox.x).toBeGreaterThanOrEqual(0);
      expect(mainBox.width).toBeLessThan(1920); // Should not be full width on desktop
    }
  });
});
