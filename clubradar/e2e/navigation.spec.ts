import { test, expect } from '@playwright/test';

test.describe('Navigation Flow', () => {
  test('should navigate to discover page', async ({ page }) => {
    await page.goto('/');
    
    // Click on discover link
    await page.getByRole('link', { name: /discover/i }).first().click();
    
    await expect(page).toHaveURL(/.*discover/);
  });

  test('should navigate to blog page', async ({ page }) => {
    await page.goto('/');
    
    // Click on blog link
    await page.getByRole('link', { name: /blog/i }).first().click();
    
    await expect(page).toHaveURL(/.*blog/);
  });

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    
    const loginLink = page.getByRole('link', { name: /login/i }).first();
    await loginLink.click();
    
    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.goto('/');
    
    const signupLink = page.getByRole('link', { name: /sign up/i }).first();
    await signupLink.click();
    
    await expect(page).toHaveURL(/.*signup/);
  });

  test('should navigate using footer links', async ({ page }) => {
    await page.goto('/');
    
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    
    // Click on a footer link
    await page.getByRole('link', { name: /contact us/i }).click();
    
    await expect(page).toHaveURL(/.*contact/);
  });

  test('should navigate back using browser back button', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /blog/i }).first().click();
    await expect(page).toHaveURL(/.*blog/);
    
    await page.goBack();
    await expect(page).toHaveURL('/');
  });
});

