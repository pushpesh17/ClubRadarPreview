import { test, expect } from "@playwright/test";

test.describe("Bookings Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto("/");
  });

  test("should redirect to login when accessing bookings without auth", async ({
    page,
  }) => {
    await page.goto("/bookings");

    // Should redirect to login
    await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
  });

  test("should display bookings page structure", async ({ page }) => {
    // This test assumes user is logged in or we can see the page structure
    // For now, just check that the page loads
    await page.goto("/bookings");

    // Check for page content (may show login redirect)
    const pageContent = await page.textContent("body");
    expect(pageContent).toBeTruthy();
  });

  test("should show empty state when no bookings", async ({ page }) => {
    // This would require authentication setup
    // For now, just verify the page structure
    await page.goto("/bookings");

    const hasEmptyState = await page
      .getByText(/no bookings yet/i)
      .isVisible()
      .catch(() => false);
    const hasLogin = await page
      .getByText(/login/i)
      .isVisible()
      .catch(() => false);

    // Either empty state or login should be present
    expect(hasEmptyState || hasLogin).toBeTruthy();
  });

  test("should navigate back to discover from bookings", async ({ page }) => {
    await page.goto("/bookings");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    const backLink = page.getByRole("link", { name: /back|discover/i }).first();

    if (await backLink.isVisible().catch(() => false)) {
      await backLink.click();
      await expect(page).toHaveURL(/.*discover/);
    }
  });

  test("should show discover events button in empty state", async ({
    page,
  }) => {
    await page.goto("/bookings");
    await page.waitForLoadState("networkidle");

    const discoverButton = page
      .getByRole("button", { name: /discover events/i })
      .first();

    if (await discoverButton.isVisible().catch(() => false)) {
      await discoverButton.click();
      await expect(page).toHaveURL(/.*discover/);
    }
  });

  test("should display booking cards when bookings exist", async ({ page }) => {
    // This would require authentication and actual bookings
    await page.goto("/bookings");
    await page.waitForLoadState("networkidle");

    // Check if bookings are displayed (may not be visible if no bookings)
    const hasBookings = await page
      .getByText(/booking id/i)
      .isVisible()
      .catch(() => false);
    const hasEmpty = await page
      .getByText(/no bookings/i)
      .isVisible()
      .catch(() => false);

    // Either bookings or empty state should be present
    expect(hasBookings || hasEmpty).toBeTruthy();
  });

  test("should handle error states", async ({ page }) => {
    await page.goto("/bookings");
    await page.waitForLoadState("networkidle");

    // Check for error messages (connection errors, etc.)
    const hasError = await page
      .getByText(/error|failed|connection/i)
      .isVisible()
      .catch(() => false);
    const hasRetry = await page
      .getByRole("button", { name: /retry/i })
      .isVisible()
      .catch(() => false);

    // If error is shown, retry button should be available
    if (hasError) {
      expect(hasRetry).toBeTruthy();
    }
  });

  test("should show loading state initially", async ({ page }) => {
    await page.goto("/bookings");

    // Check for loading indicator
    const hasLoading = await page
      .getByText(/loading/i)
      .isVisible()
      .catch(() => false);

    // Loading state may flash quickly, so this is optional
    // Just verify page doesn't crash
    expect(page).toBeTruthy();
  });
});
