import { expect } from '@playwright/test';

import { test } from './extension-setup';

test.describe('Whitelisting', () => {
  test('Request page whitelisting', async ({ page, context }) => {
    await page.goto(`https://app.emeris.com`);

    // negative test
    expect(
      await page.evaluate(() => {
        return window.emeris.supportedChains();
      }),
    ).toBe(false); // TODO the response should be a thrown error imo

    const [popup] = await Promise.all([
      // It is important to call waitForEvent before click to set up waiting.
      context.waitForEvent('page'), // the background worker opens a new page which is the popup
      // Opens popup.
      page.evaluate(() => {
        window.emeris.enable();
      }),
    ]);
    await popup.click('text=Accept');

    // positive test
    expect(
      async () =>
        await page.evaluate(() => {
          return window.emeris.supportedChains();
        }),
    ).not.toBe(false);

    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html#/whitelisted?browser=true`);
    await expect(page.locator('text=https://app.emeris.com').first()).toBeVisible();

    // disconnect page
    await page.click('text=disconnect');
    await page.click('text=Remove');

    // check if disconnected
    await expect(page.locator('text=https://app.emeris.com')).not.toBeVisible();
    await page.goto(`https://app.emeris.com`);
    expect(
      await page.evaluate(() => {
        return window.emeris.supportedChains();
      }),
    ).toBe(false); // TODO the response should be a thrown error imo
  });
});
