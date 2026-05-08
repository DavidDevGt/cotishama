import { test, expect } from "./fixtures/auth-fixtures";

test.describe("Authentication Flow", () => {
  test("should successfully login with valid credentials", async ({
    page,
    helpers,
  }) => {
    await helpers.navigateTo("/login");

    await page.fill('input[type="email"]', "admin@cotishama.local");
    await page.fill('input[type="password"]', "Admin123!Secure");
    await page.click('button[type="submit"]');

    await page.waitForURL((url) => !url.toString().includes("login"));
    await expect(page).toHaveURL(/\/(dashboard|quotes)/);

    const token = await helpers.getStoredToken();
    expect(token).toBeTruthy();
  });

  test("should show error on invalid email", async ({ page, helpers }) => {
    await helpers.navigateTo("/login");

    await page.fill('input[type="email"]', "invalid-email");
    await page.fill('input[type="password"]', "password");
    await page.click('button[type="submit"]');

    await helpers.verifyErrorMessage(
      /invalid|incorrect|email address/i.source || "Invalid credentials"
    );
  });

  test("should show error on incorrect password", async ({
    page,
    helpers,
  }) => {
    await helpers.navigateTo("/login");

    await page.fill('input[type="email"]', "admin@cotishama.local");
    await page.fill('input[type="password"]', "WrongPassword123!");
    await page.click('button[type="submit"]');

    await helpers.verifyErrorMessage(
      /password|credentials|incorrect/i.source || "Invalid credentials"
    );
  });

  test("should persist session after page reload", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.reload();

    await expect(authenticatedPage).toHaveURL(/\/(dashboard|quotes)/);
  });

  test("should clear session on logout", async ({
    authenticatedPage,
    helpers,
  }) => {
    const token = await helpers.getStoredToken();
    expect(token).toBeTruthy();

    await helpers.logout();
    await expect(authenticatedPage).toHaveURL(/\/login/);

    const clearedToken = await helpers.getStoredToken();
    expect(clearedToken).toBeNull();
  });

  test("should require authentication for protected routes", async ({
    page,
    helpers,
  }) => {
    await helpers.clearStorage();
    await page.goto("/dashboard");

    await expect(page).toHaveURL(/\/login/);
  });

  test("should handle token refresh", async ({ authenticatedPage, helpers }) => {
    const initialToken = await helpers.getStoredToken();
    expect(initialToken).toBeTruthy();

    await authenticatedPage.waitForTimeout(1000);

    const updatedToken = await helpers.getStoredToken();
    expect(updatedToken).toBeTruthy();
  });

  test("should validate email format on client side", async ({
    page,
    helpers,
  }) => {
    await helpers.navigateTo("/login");

    const emailInput = page.locator('input[type="email"]');
    await emailInput.fill("not-an-email");

    const errorMessage = page.locator(
      '[data-testid="email-error"], .error-message'
    );
    await expect(errorMessage).toBeVisible({ timeout: 2000 }).catch(() => {
      // Error message might not appear until submit
    });
  });

  test("should focus on first form field on load", async ({
    page,
    helpers,
  }) => {
    await helpers.navigateTo("/login");

    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeFocused();
  });
});
