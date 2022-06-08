/* eslint-disable max-lines-per-function */
import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { emerisLoaded, enableWebsite, importAccount } from './helpers';

test.describe('Whitelisting', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`https://emeris.com//`);
    await emerisLoaded(page);

    // negative test
    expect(
      await page.evaluate(() => {
        return window.emeris.supportedChains();
      }),
    ).toBe(false); // TODO the response should be a thrown error imo
  });
  test('Request page whitelisting', async ({ page, context }) => {
    await importAccount(page);
    await enableWebsite(context, page);

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

    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html#/whitelisted?browser=true`);
    await expect(page.locator('text=Managed connected sites')).toBeVisible();
    await expect(page.locator('text=https://emeris.com').first()).toBeVisible();

    // disconnect page
    await page.click('text=disconnect');
    await page.click('text=Remove');

    // check if disconnected
    await expect(page.locator('text=Managed connected sites')).toBeVisible();
    await expect(page.locator('text=https://emeris.com')).not.toBeVisible();
    await page.goto(`https://emeris.com/`);
    await emerisLoaded(page);
    expect(
      await page.evaluate(() => {
        return window.emeris.supportedChains();
      }),
    ).toBe(false); // TODO the response should be a thrown error imo
  });
  test('Request page whitelisting with keplr compatible enable command', async ({ page, context }) => {
    await importAccount(page);
    await enableWebsite(context, page, true);

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
