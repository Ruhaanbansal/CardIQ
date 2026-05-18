import { test, expect } from '@playwright/test';

test.describe('Optimizer Engine E2E Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to optimizer and set up mocked local state if needed
    await page.goto('/optimizer');
  });

  test('should optimize a transaction and render the correct result card', async ({ page, isMobile }) => {
    // Wait for the input component to hydrate
    await expect(page.locator('h1').getByText(/Optimize Transaction/i)).toBeVisible();

    // Fill the transaction form
    await page.fill('input[placeholder="e.g. Amazon, Zomato"]', 'Amazon');
    
    // Select the first autocomplete result if it appears
    const autocompleteDropdown = page.locator('.autocomplete-dropdown');
    if (await autocompleteDropdown.isVisible()) {
        await autocompleteDropdown.locator('li').first().click();
    }

    await page.fill('input[placeholder="Amount (₹)"]', '5000');
    
    // Submit the optimization request
    await page.click('button:has-text("Find Best Card")');

    // Wait for the deterministic engine to return the result
    const resultCard = page.locator('.optimization-result-card').first();
    await expect(resultCard).toBeVisible({ timeout: 10000 }); // Allow time for API simulation

    // Verify visual elements of the result
    await expect(resultCard.locator('h4').getByText(/SBI Cashback/i)).toBeVisible();
    await expect(page.getByText(/5% Cashback/i)).toBeVisible();

    // Optional: Visual regression snapshot of the result
    if (!isMobile) {
      await expect(resultCard).toHaveScreenshot('optimizer-result-desktop.png', { maxDiffPixels: 100 });
    }
  });
});
