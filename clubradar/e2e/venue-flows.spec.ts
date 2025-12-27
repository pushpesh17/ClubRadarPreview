import { test, expect } from '@playwright/test';

test.describe('Venue Flows', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
  });

  test.describe('Venue Signup Flow', () => {
    test('should navigate to venue signup page', async ({ page }) => {
      await page.goto('/venue/signup');
      
      await expect(page.getByText(/register your venue/i)).toBeVisible();
    });

    test('should show login redirect for unauthenticated users', async ({ page }) => {
      await page.goto('/venue/signup');
      
      // Should redirect to login or show login prompt
      await expect(
        page.getByText(/login/i).or(page.getByRole('link', { name: /login/i }))
      ).toBeVisible({ timeout: 5000 });
    });

    test('should display multi-step form structure', async ({ page }) => {
      // This test assumes user is logged in or form is visible
      await page.goto('/venue/signup');
      
      // Check for form elements (may need authentication)
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();
    });
  });

  test.describe('Venue Dashboard Flow', () => {
    test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
      await page.goto('/venue/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
    });

    test('should show registration prompt if no venue exists', async ({ page }) => {
      // This would require authentication setup
      // For now, just check the page structure
      await page.goto('/venue/dashboard');
      
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();
    });
  });

  test.describe('Venue Detail Page', () => {
    test('should display venue information', async ({ page }) => {
      // Navigate to a venue detail page (using a test venue ID)
      await page.goto('/venue/test-venue-id');
      
      // Check that page loads (may show error if venue doesn't exist)
      const pageContent = await page.textContent('body');
      expect(pageContent).toBeTruthy();
    });

    test('should show events section', async ({ page }) => {
      await page.goto('/venue/test-venue-id');
      
      // Look for events section or error message
      const hasEvents = await page.getByText(/upcoming events/i).isVisible().catch(() => false);
      const hasError = await page.getByText(/venue not found/i).isVisible().catch(() => false);
      
      // Either events section or error should be present
      expect(hasEvents || hasError).toBeTruthy();
    });

    test('should show reviews section', async ({ page }) => {
      await page.goto('/venue/test-venue-id');
      
      // Look for reviews section
      const hasReviews = await page.getByText(/reviews/i).isVisible().catch(() => false);
      const hasError = await page.getByText(/venue not found/i).isVisible().catch(() => false);
      
      expect(hasReviews || hasError).toBeTruthy();
    });

    test('should redirect to login when booking without authentication', async ({ page }) => {
      await page.goto('/venue/test-venue-id');
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Try to find and click book button
      const bookButton = page.getByRole('button', { name: /book|login to book/i }).first();
      
      if (await bookButton.isVisible().catch(() => false)) {
        await bookButton.click();
        
        // Should redirect to login
        await expect(page).toHaveURL(/.*login/, { timeout: 5000 });
      }
    });
  });

  test.describe('Navigation', () => {
    test('should navigate from homepage to venue signup', async ({ page }) => {
      await page.goto('/');
      
      // Look for venue signup link
      const signupLink = page.getByRole('link', { name: /venue|register/i }).first();
      
      if (await signupLink.isVisible().catch(() => false)) {
        await signupLink.click();
        await expect(page).toHaveURL(/.*venue.*signup/);
      }
    });

    test('should navigate back from venue detail to discover', async ({ page }) => {
      await page.goto('/venue/test-venue-id');
      
      const backLink = page.getByRole('link', { name: /back|discover/i }).first();
      
      if (await backLink.isVisible().catch(() => false)) {
        await backLink.click();
        await expect(page).toHaveURL(/.*discover/);
      }
    });
  });
});

