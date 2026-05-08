import { test as base, Page } from "@playwright/test";
import { TestHelpers, generateTestEmail } from "../utils/test-helpers";

export const TEST_USERS = {
  admin: {
    email: "admin@cotishama.local",
    password: "Admin123!Secure",
    role: "admin",
  },
  manager: {
    email: "manager@cotishama.local",
    password: "Manager123!Secure",
    role: "manager",
  },
  user: {
    email: "user@cotishama.local",
    password: "User123!Secure",
    role: "user",
  },
};

type AuthFixtures = {
  authenticatedPage: Page;
  helpers: TestHelpers;
  testEmail: string;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    const helpers = new TestHelpers(page);
    await helpers.login(TEST_USERS.admin.email, TEST_USERS.admin.password);
    await use(page);
    await helpers.logout();
  },

  helpers: async ({ page }, use) => {
    const helpers = new TestHelpers(page);
    await use(helpers);
  },

  testEmail: async ({}, use) => {
    const email = generateTestEmail();
    await use(email);
  },
});

export { expect } from "@playwright/test";
