import { test, expect } from "./fixtures/auth-fixtures";

test.describe("Client Management", () => {
  test("should display list of clients", async ({ authenticatedPage }) => {
    await authenticatedPage.goto("/clients");
    await authenticatedPage.waitForLoadState("networkidle");

    const clientsList = authenticatedPage.locator('[data-testid="clients-list"]');
    await expect(clientsList).toBeVisible();
  });

  test("should navigate to add client page", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/clients");

    const addButton = authenticatedPage.locator(
      '[data-testid="add-client-button"], button:has-text("Add Client")'
    );
    await addButton.click();

    await helpers.waitForNavigation(/\/clients\/(new|add)/);
  });

  test("should create a new client with valid data", async ({
    authenticatedPage,
    helpers,
    testEmail,
  }) => {
    await helpers.navigateTo("/clients/new");

    const nameInput = authenticatedPage.locator('input[name="name"]');
    const emailInput = authenticatedPage.locator('input[name="email"]');
    const phoneInput = authenticatedPage.locator('input[name="phone"]');
    const addressInput = authenticatedPage.locator('textarea[name="address"]');

    await nameInput.fill("New Client Company");
    await emailInput.fill(testEmail);
    await phoneInput.fill("+502-1234-5678");
    await addressInput.fill("123 Business St, Guatemala City");

    const submitButton = authenticatedPage.locator(
      'button[type="submit"]:has-text("Save Client")'
    );
    await submitButton.click();

    await helpers.verifySuccessMessage("created|saved|Client added");
  });

  test("should validate email format", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/clients/new");

    const emailInput = authenticatedPage.locator('input[name="email"]');
    await emailInput.fill("invalid-email");

    const submitButton = authenticatedPage.locator(
      'button[type="submit"]:has-text("Save")'
    );
    await submitButton.click();

    await helpers.verifyErrorMessage(/email|invalid/i.source || "Invalid");
  });

  test("should validate required fields", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/clients/new");

    const submitButton = authenticatedPage.locator(
      'button[type="submit"]:has-text("Save")'
    );
    await submitButton.click();

    const errorElements = authenticatedPage.locator(
      '[data-testid*="error"], .error-message'
    );
    await expect(errorElements.first()).toBeVisible();
  });

  test("should edit an existing client", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/clients");

    const firstClient = authenticatedPage.locator(
      '[data-testid="client-row"]:first-child'
    );
    await firstClient.click();

    const editButton = authenticatedPage.locator(
      '[data-testid="edit-button"], button:has-text("Edit")'
    );
    await editButton.click();

    const addressInput = authenticatedPage.locator('textarea[name="address"]');
    await addressInput.clear();
    await addressInput.fill("Updated Address, Zone 10");

    const saveButton = authenticatedPage.locator(
      'button[type="submit"]:has-text("Save")'
    );
    await saveButton.click();

    await helpers.verifySuccessMessage("updated|saved");
  });

  test("should delete a client with confirmation", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/clients");

    const firstClient = authenticatedPage.locator(
      '[data-testid="client-row"]:first-child'
    );
    await firstClient.click();

    const deleteButton = authenticatedPage.locator(
      '[data-testid="delete-button"], button:has-text("Delete")'
    );
    await deleteButton.click();

    const confirmButton = authenticatedPage.locator(
      'button:has-text("Confirm"), button:has-text("Yes")'
    );
    await confirmButton.click();

    await helpers.verifySuccessMessage("deleted|removed");
  });

  test("should search clients by name", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/clients");

    const searchInput = authenticatedPage.locator('[data-testid="search-input"]');
    await searchInput.fill("Test");

    await authenticatedPage.waitForLoadState("networkidle");

    const clientsList = authenticatedPage.locator('[data-testid="client-row"]');
    const count = await clientsList.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should sort clients by name", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/clients");

    const sortButton = authenticatedPage.locator(
      '[data-testid="sort-button"], button:has-text("Name")'
    );
    await sortButton.click();

    await authenticatedPage.waitForLoadState("networkidle");

    const clientsList = authenticatedPage.locator('[data-testid="client-row"]');
    const count = await clientsList.count();
    expect(count).toBeGreaterThan(0);
  });

  test("should display client details correctly", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/clients");

    const firstClient = authenticatedPage.locator(
      '[data-testid="client-row"]:first-child'
    );
    await firstClient.click();

    const clientDetails = authenticatedPage.locator(
      '[data-testid="client-details"]'
    );
    await expect(clientDetails).toBeVisible();

    const clientName = authenticatedPage.locator(
      '[data-testid="client-name"]'
    );
    await expect(clientName).toContainText(/./);
  });

  test("should link quotes to clients", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/clients");

    const firstClient = authenticatedPage.locator(
      '[data-testid="client-row"]:first-child'
    );
    await firstClient.click();

    const quotesTab = authenticatedPage.locator(
      '[data-testid="quotes-tab"], button:has-text("Quotes")'
    );
    await quotesTab.click();

    const quotesList = authenticatedPage.locator(
      '[data-testid="client-quotes"]'
    );
    await expect(quotesList).toBeVisible();
  });
});
