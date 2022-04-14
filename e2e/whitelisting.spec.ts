import { expect } from '@playwright/test';

import { test } from './extension-setup';

test.describe('Whitelisting', () => {
  test('Request page enabling', async ({ page, context }) => {
    await page.goto(`https://app.emeris.com`);

    expect(
      await page.evaluate(() => {
        return window.emeris.supportedChains();
      }),
    ).toBe(false); // TODO the response should be a thrown error imo

    const [popup] = await Promise.all([
      // It is important to call waitForEvent before click to set up waiting.
      context.waitForEvent('page'),
      // Opens popup.
      page.evaluate(() => {
        window.emeris.enable();
      }),
    ]);
    await popup.click('text=Accept');

    expect(
      async () =>
        await page.evaluate(() => {
          return window.emeris.supportedChains();
        }),
    ).not.toBe(false);
  });
});
