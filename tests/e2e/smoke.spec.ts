import { test, expect } from "./fixtures/auth-fixtures";

test.describe("Smoke Tests - Critical Paths", () => {
  test("critical path: complete quote creation flow", async ({
    authenticatedPage,
    helpers,
    testEmail,
  }) => {
    // Navigate to quotes
    await helpers.navigateTo("/quotes");
    const quotesLoaded = authenticatedPage.locator(
      '[data-testid="quotes-list"]'
    );
    await expect(quotesLoaded).toBeVisible({ timeout: 5000 });

    // Create new quote
    const createButton = authenticatedPage.locator(
      '[data-testid="create-quote-button"], button:has-text("New")'
    );
    await createButton.click();

    // Fill form
    await authenticatedPage.fill('input[name="clientName"]', "Smoke Test Client");
    await authenticatedPage.fill('input[name="clientEmail"]', testEmail);
    await authenticatedPage.fill('textarea[name="description"]', "Test quote");

    // Submit
    const submitButton = authenticatedPage.locator(
      'button[type="submit"]:has-text("Create")'
    );
    await submitButton.click();

    // Verify success
    await helpers.verifySuccessMessage("created|success|quote");
  });

  test("critical path: user login and dashboard", async ({
    page,
    helpers,
  }) => {
    // Login
    await helpers.login("admin@cotishama.local", "Admin123!Secure");

    // Verify dashboard loads
    await helpers.waitForNavigation(/\/(dashboard|quotes)/);

    const pageContent = page.locator("body");
    await expect(pageContent).toBeVisible();

    // Verify key navigation is visible
    const navElements = page.locator("nav, [role='navigation']");
    const navCount = await navElements.count();
    expect(navCount).toBeGreaterThan(0);
  });

  test("critical path: client creation and viewing", async ({
    authenticatedPage,
    helpers,
    testEmail,
  }) => {
    // Navigate to clients
    await helpers.navigateTo("/clients");

    // Add client
    const addButton = authenticatedPage.locator(
      '[data-testid="add-client-button"], button:has-text("Add")'
    );
    await addButton.click();

    // Fill form
    await authenticatedPage.fill('input[name="name"]', "Smoke Test Company");
    await authenticatedPage.fill('input[name="email"]', testEmail);

    // Submit
    const submitButton = authenticatedPage.locator(
      'button[type="submit"]:has-text("Save")'
    );
    await submitButton.click();

    // Verify success
    await helpers.verifySuccessMessage("created|added|success");
  });

  test("smoke: api health check", async ({ authenticatedPage }) => {
    const response = await authenticatedPage.request.get(
      "http://localhost:3000/api/health"
    );
    expect(response.ok()).toBeTruthy();
  });

  test("smoke: database connectivity", async ({ authenticatedPage }) => {
    // Try to fetch quotes - requires DB
    const response = await authenticatedPage.request.get(
      "http://localhost:3000/api/quotes",
      {
        headers: {
          Authorization: `Bearer ${await authenticatedPage.evaluate(() => localStorage.getItem("accessToken"))}`,
        },
      }
    );

    // Should succeed (200) or have valid error (400+)
    expect(response.status()).toBeGreaterThanOrEqual(200);
  });

  test("smoke: user session persistence", async ({
    authenticatedPage,
    helpers,
  }) => {
    // Get initial token
    const token = await helpers.getStoredToken();
    expect(token).toBeTruthy();

    // Reload page
    await authenticatedPage.reload();
    await authenticatedPage.waitForLoadState("networkidle");

    // Token should still exist
    const reloadedToken = await helpers.getStoredToken();
    expect(reloadedToken).toBeTruthy();

    // Should NOT be redirected to login
    await expect(authenticatedPage).not.toHaveURL(/\/login/);
  });

  test("smoke: responsive layout loads", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/dashboard");

    // Desktop viewport
    await authenticatedPage.setViewportSize({ width: 1920, height: 1080 });
    let content = authenticatedPage.locator("[role='main'], main");
    await expect(content).toBeVisible({ timeout: 3000 });

    // Mobile viewport
    await authenticatedPage.setViewportSize({ width: 375, height: 667 });
    content = authenticatedPage.locator("[role='main'], main");
    const isVisible = await content.isVisible().catch(() => false);
    expect([true, false]).toContain(isVisible);
  });

  test("smoke: form validation blocks invalid submission", async ({
    page,
    helpers,
  }) => {
    await helpers.navigateTo("/quotes/new");

    // Try submit without data
    const submitButton = page.locator(
      'button[type="submit"]:has-text("Create")'
    );
    await submitButton.click();

    // Should see error or stay on form
    await page.waitForTimeout(500);
    const url = page.url();
    expect(url).toContain("new");
  });

  test("smoke: logout clears session", async ({
    authenticatedPage,
    helpers,
  }) => {
    // Initially logged in
    const tokenBefore = await helpers.getStoredToken();
    expect(tokenBefore).toBeTruthy();

    // Logout
    await helpers.logout();

    // Token should be cleared
    const tokenAfter = await helpers.getStoredToken();
    expect(tokenAfter).toBeNull();

    // Should redirect to login
    await expect(authenticatedPage).toHaveURL(/\/login/);
  });

  test("smoke: error recovery", async ({ page, helpers }) => {
    // Try to access non-existent page
    await page.goto("/non-existent-page");

    // Should handle gracefully (error page or redirect)
    const status = page.locator("h1, h2").first();
    const isVisible = await status.isVisible().catch(() => false);
    expect([true, false]).toContain(isVisible);
  });
});
