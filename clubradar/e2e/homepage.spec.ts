import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loaded
    await expect(page).toHaveTitle(/ClubRadar/i);
    
    // Check for main navigation elements
    await expect(page.getByText('ClubRadar')).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    await page.goto('/');
    
    // Check desktop navigation
    await expect(page.getByRole('link', { name: /for users/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /for venues/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /blog/i })).toBeVisible();
  });

  test('should have working login link', async ({ page }) => {
    await page.goto('/');
    
    const loginLink = page.getByRole('link', { name: /login/i }).first();
    await expect(loginLink).toBeVisible();
    
    await loginLink.click();
    await expect(page).toHaveURL(/.*login/);
  });

  test('should have working signup link', async ({ page }) => {
    await page.goto('/');
    
    const signupLink = page.getByRole('link', { name: /sign up/i }).first();
    await expect(signupLink).toBeVisible();
    
    await signupLink.click();
    await expect(page).toHaveURL(/.*signup/);
  });

  test('should display footer with links', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Check footer content
    await expect(page.getByText('ClubRadar')).toBeVisible();
    await expect(page.getByText('For Users')).toBeVisible();
    await expect(page.getByText('For Venues')).toBeVisible();
    await expect(page.getByText('Support')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check mobile menu button is visible
    const menuButton = page.getByRole('button', { name: /menu/i });
    await expect(menuButton).toBeVisible();
    
    // Open mobile menu
    await menuButton.click();
    
    // Check mobile menu content
    await expect(page.getByText('Menu')).toBeVisible();
  });
});

