/* eslint-disable max-lines-per-function */
import { expect } from '@playwright/test';

import { test } from './extension-setup';

/* eslint-disable max-lines-per-function */
test.describe('Deliberately failing test', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
  });

  test('Looking for a text that doesnt exist to see if it creates and uploads a video', async ({ page }) => {
    await expect(page.locator('text=Create Account >> visible=true')).toBeVisible();
    await page.click('text=Create Account >> visible=true');
    await page.fill('[placeholder="Enter a password"]', '123456A$');
    await page.fill('[placeholder="Confirm password"]', '123456A$');
    await page.click('text=Continue');
    await page.fill('[placeholder="Surfer"]', 'Test Account Created');
    await page.click('text=Continue');
    await page.click('text=Back up later');
    await page.click('text=I understand');
    await page.click('text=Continue');
    await page.click('text=NOT EXISTING TEXT FOR TESTING');
    await expect(page.locator('text=Test Account Created >> visible=true')).toBeVisible();
  });
});
