import { Page, expect } from "@playwright/test";

export class TestHelpers {
  constructor(private page: Page) {}

  async login(email: string, password: string): Promise<void> {
    await this.page.goto("/login");
    await this.page.fill('input[type="email"]', email);
    await this.page.fill('input[type="password"]', password);
    await this.page.click('button[type="submit"]');

    await this.page.waitForURL((url) => !url.toString().includes("login"));
    await expect(this.page).not.toHaveURL(/\/login/);
  }

  async logout(): Promise<void> {
    const userMenuButton = this.page.locator('[data-testid="user-menu-button"]');
    await userMenuButton.click();

    const logoutButton = this.page.locator('[data-testid="logout-button"]');
    await logoutButton.click();

    await this.page.waitForURL((url) => url.toString().includes("login"));
  }

  async waitForNavigation(pattern: RegExp): Promise<void> {
    await this.page.waitForURL(pattern);
  }

  async fillForm(
    fields: Record<string, string>,
    submitSelector: string = 'button[type="submit"]'
  ): Promise<void> {
    for (const [selector, value] of Object.entries(fields)) {
      await this.page.fill(selector, value);
    }
    await this.page.click(submitSelector);
  }

  async verifyErrorMessage(errorText: string): Promise<void> {
    const errorElement = this.page.locator(`text="${errorText}"`);
    await expect(errorElement).toBeVisible();
  }

  async verifySuccessMessage(successText: string): Promise<void> {
    const successElement = this.page.locator(`text="${successText}"`);
    await expect(successElement).toBeVisible();
  }

  async navigateTo(path: string): Promise<void> {
    await this.page.goto(path);
    await this.page.waitForLoadState("networkidle");
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `test-results/screenshots/${name}.png` });
  }

  async getStoredToken(): Promise<string | null> {
    return await this.page.evaluate(() => localStorage.getItem("accessToken"));
  }

  async clearStorage(): Promise<void> {
    await this.page.context().clearCookies();
    await this.page.evaluate(() => localStorage.clear());
    await this.page.evaluate(() => sessionStorage.clear());
  }
}

export async function generateTestEmail(): string {
  return `test-${Date.now()}@cotishama.local`;
}

export async function generateTestData() {
  return {
    email: generateTestEmail(),
    password: "SecurePassword123!",
    firstName: "Test",
    lastName: "User",
    company: "Test Company",
    clientName: "Test Client",
    clientEmail: "client@test.local",
    clientPhone: "+502-1234-5678",
  };
}
