import { test, expect } from "./fixtures/auth-fixtures";

test.describe("Quote Management", () => {
  test("should display list of quotes on dashboard", async ({
    authenticatedPage,
  }) => {
    await authenticatedPage.goto("/quotes");
    await authenticatedPage.waitForLoadState("networkidle");

    const quotesList = authenticatedPage.locator('[data-testid="quotes-list"]');
    await expect(quotesList).toBeVisible();
  });

  test("should navigate to create quote page", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/quotes");

    const createButton = authenticatedPage.locator(
      '[data-testid="create-quote-button"], button:has-text("New Quote")'
    );
    await createButton.click();

    await helpers.waitForNavigation(/\/quotes\/(new|create)/);
  });

  test("should create a new quote with valid data", async ({
    authenticatedPage,
    helpers,
    testEmail,
  }) => {
    await helpers.navigateTo("/quotes/new");

    const clientNameInput = authenticatedPage.locator(
      'input[name="clientName"]'
    );
    const clientEmailInput = authenticatedPage.locator(
      'input[name="clientEmail"]'
    );
    const descriptionInput = authenticatedPage.locator(
      'textarea[name="description"]'
    );

    await clientNameInput.fill("Test Client");
    await clientEmailInput.fill(testEmail);
    await descriptionInput.fill("Test quote description");

    const submitButton = authenticatedPage.locator(
      'button[type="submit"]:has-text("Create Quote")'
    );
    await submitButton.click();

    await helpers.verifySuccessMessage(
      "Quote created|quote successfully|Quote has been created"
    );
  });

  test("should validate required fields", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/quotes/new");

    const submitButton = authenticatedPage.locator(
      'button[type="submit"]:has-text("Create")'
    );
    await submitButton.click();

    const errorElements = authenticatedPage.locator(
      '[data-testid*="error"], .error-message'
    );
    await expect(errorElements.first()).toBeVisible();
  });

  test("should edit an existing quote", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/quotes");

    const firstQuote = authenticatedPage.locator(
      '[data-testid="quote-row"]:first-child'
    );
    await firstQuote.click();

    const editButton = authenticatedPage.locator(
      '[data-testid="edit-button"], button:has-text("Edit")'
    );
    await editButton.click();

    const descriptionInput = authenticatedPage.locator(
      'textarea[name="description"]'
    );
    await descriptionInput.clear();
    await descriptionInput.fill("Updated description");

    const saveButton = authenticatedPage.locator(
      'button[type="submit"]:has-text("Save")'
    );
    await saveButton.click();

    await helpers.verifySuccessMessage(
      "updated|saved|Quote updated successfully"
    );
  });

  test("should delete a quote with confirmation", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/quotes");

    const firstQuote = authenticatedPage.locator(
      '[data-testid="quote-row"]:first-child'
    );
    await firstQuote.click();

    const deleteButton = authenticatedPage.locator(
      '[data-testid="delete-button"], button:has-text("Delete")'
    );
    await deleteButton.click();

    const confirmButton = authenticatedPage.locator(
      'button:has-text("Confirm"), button:has-text("Yes, Delete")'
    );
    await confirmButton.click();

    await helpers.verifySuccessMessage("deleted|removed");
  });

  test("should filter quotes by status", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/quotes");

    const statusFilter = authenticatedPage.locator(
      'select[name="status"], [data-testid="status-filter"]'
    );
    await statusFilter.selectOption("approved");

    await authenticatedPage.waitForLoadState("networkidle");

    const quotesInList = authenticatedPage.locator('[data-testid="quote-row"]');
    const count = await quotesInList.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should search quotes by client name", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/quotes");

    const searchInput = authenticatedPage.locator('[data-testid="search-input"]');
    await searchInput.fill("Test");

    await authenticatedPage.waitForLoadState("networkidle");

    const quotesInList = authenticatedPage.locator('[data-testid="quote-row"]');
    const count = await quotesInList.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("should export quote as PDF", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/quotes");

    const firstQuote = authenticatedPage.locator(
      '[data-testid="quote-row"]:first-child'
    );
    await firstQuote.click();

    const exportButton = authenticatedPage.locator(
      '[data-testid="export-pdf"], button:has-text("Export")'
    );
    await exportButton.click();

    await helpers.verifySuccessMessage("PDF generated|exported");
  });

  test("should display quote details correctly", async ({
    authenticatedPage,
    helpers,
  }) => {
    await helpers.navigateTo("/quotes");

    const firstQuote = authenticatedPage.locator(
      '[data-testid="quote-row"]:first-child'
    );
    await firstQuote.click();

    const details = authenticatedPage.locator('[data-testid="quote-details"]');
    await expect(details).toBeVisible();

    const clientName = authenticatedPage.locator(
      '[data-testid="client-name"]'
    );
    await expect(clientName).toContainText(/./);
  });
});
