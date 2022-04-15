import { expect } from '@playwright/test';

import { test } from './extension-setup';

test.describe('Welcome page', () => {
  test('Loader shows', async ({ page }) => {
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
    await page.waitForSelector('.ephemeris');
  });
  test('Welcome shows', async ({ page }) => {
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
    await expect(page.locator('text=Create Account >> visible=true')).toBeVisible();
    await expect(page.locator('text=Import Account >> visible=true')).toBeVisible();
    await expect(page.locator('text=Import Ledger >> visible=true')).toBeVisible();
  });
});
