import { expect } from '@playwright/test';

import { test } from './extension-setup';

test.describe('Whitelisting', () => {
  test('Request page whitelisting', async ({ page, context }) => {
    await page.goto(`https://www.google.com/`);

    // negative test
    expect(
      await page.evaluate(() => {
        return window.emeris.supportedChains();
      }),
    ).toBe(false); // TODO the response should be a thrown error imo

    await enableWebsite(context, page);

    // positive test
    expect(
      async () =>
        await page.evaluate(() => {
          return window.emeris.supportedChains();
        }),
    ).not.toBe(false);

    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html#/whitelisted?browser=true`);
    await expect(page.locator('text=https://www.google.com').first()).toBeVisible();

    // disconnect page
    await page.click('text=disconnect');
    await page.click('text=Remove');

    // check if disconnected
    await expect(page.locator('text=https://www.google.com')).not.toBeVisible();
    await page.goto(`https://www.google.com`);
    expect(
      await page.evaluate(() => {
        return window.emeris.supportedChains();
      }),
    ).toBe(false); // TODO the response should be a thrown error imo
  });
});
