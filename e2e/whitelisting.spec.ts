/* eslint-disable max-lines-per-function */
import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { accountCreate, emerisLoaded, enableWebsite } from './helpers';

test.describe('Whitelisting', () => {
  test('Request page whitelisting', async ({ page, context }) => {
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
    await accountCreate(page);

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

    let errorMessage = '';
    try {
      await page.evaluate(() => {
        return window.emeris.supportedChains();
      });
    } catch (e) {
      errorMessage = e.message;
    }
    expect(errorMessage).toContain('Website has not been whitelisted');
  });

  test('Request page whitelisting with keplr compatible enable command', async ({ page, context }) => {
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
    await accountCreate(page);

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
