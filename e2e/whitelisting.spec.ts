/* eslint-disable max-lines-per-function */
import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { emerisLoaded, makeWalletReadyForRequests } from './helpers';

test.describe('Whitelisting', () => {
  test('Request page whitelisting', async ({ page, context }) => {
    await makeWalletReadyForRequests(context, page);

    expect(
      await page.evaluate(() => {
        return window.emeris.enable();
      }),
    ).toBe(true);

    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html#/whitelisted?browser=true`);
    await expect(page.locator('text=Managed connected sites')).toBeVisible();
    await expect(page.locator('[data-testId="whitelisted-websites"]')).toBeVisible();
    await expect(page.locator('text=https://www.google.com').first()).toBeVisible();

    // disconnect page
    await page.click('text=disconnect');
    await page.click('text=Remove');

    // check if disconnected
    await expect(page.locator('text=Managed connected sites')).toBeVisible();
    await expect(page.locator('text=https://www.google.com')).not.toBeVisible();
    await page.goto(`https://www.google.com`);
    await emerisLoaded(page);
    // should be false as page is not whitelisted yet
    expect(await page.evaluate(async () => await window.emeris.supportedChains().then((r) => !!r))).toBe(false);
  });

  test('Request page whitelisting with keplr compatible enable command', async ({ page, context }) => {
    await makeWalletReadyForRequests(context, page);
    // positive test
    expect(
      await page.evaluate(() => {
        return window.emeris.supportedChains();
      }),
    ).not.toBe(true);

    expect(
      await page.evaluate(() => {
        return window.emeris.enable();
      }),
    ).toBe(true);
  });
});
