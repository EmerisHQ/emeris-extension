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
    expect(
      await page.evaluate(() => {
        return !!window.emeris.supportedChains();
      }),
    ).toBe(true); // can always query this method with or without auth
  });

  test('Request page whitelisting with keplr compatible enable command', async ({ page, context }) => {
    await makeWalletReadyForRequests(context, page);
    // positive test
    expect(
      await page.evaluate(() => {
        return window.emeris.supportedChains();
      }),
    ).not.toBe(false);

    expect(
      await page.evaluate(() => {
        return window.emeris.enable();
      }),
    ).toBe(true);
  });
});
