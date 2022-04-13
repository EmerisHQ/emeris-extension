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

test.describe('Account Create', () => {
  test('Create Account', async ({ page }) => {
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
    await expect(page.locator('text=Create Account >> visible=true')).toBeVisible();
    await page.click('text=Create Account >> visible=true');
    await page.fill('[placeholder="Enter a password"]', '123456A$');
    await page.fill('[placeholder="Confirm password"]', '123456A$');
    await page.click('text=Continue');
    await page.fill('[placeholder="Account Name"]', 'Test Account Created');
    await page.click('text=Continue');
    await page.click('text=Back up later');
    await page.click('text=I understand');
    await page.click('text=Continue');
    await expect(page.locator('text=Test Account Created >> visible=true')).toBeVisible();
  });
  test('Create Account with backup', async ({ page }) => {
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
    await expect(page.locator('text=Create Account >> visible=true')).toBeVisible();
    await page.click('text=Create Account >> visible=true');

    await page.fill('[placeholder="Enter a password"]', '123456A$');
    await page.fill('[placeholder="Confirm password"]', '123456A$');
    await page.click('text=Continue');

    await page.fill('[placeholder="Account Name"]', 'Test Account Created');
    await page.click('text=Continue');

    await page.click('text=Back up now');

    await page.fill('[placeholder="Password"]', '123456A$');
    await page.click('text=Show mnemonic');

    const mnemonic = await page.locator('.word > span').allTextContents();
    await page.click('text=I have backed up');
    await page.click('text=Continue');

    for (let i = 0; i <= 2; i++) {
      const numberRegexp = /Select the (\d+)\w+ word in your recovery phrase/;
      const numberPhrase = await page.locator(`text=word in your recovery phrase`).textContent();
      const [, number] = numberRegexp.exec(numberPhrase);
      await page.click(`text=${mnemonic[Number(number) - 1]}`);
    }

    await page.click('text=Continue');

    await expect(page.locator('text=Get started by funding your wallet >> visible=true')).toBeVisible();

    // TODO refactor and add persitency
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/backup`);

    await page.click('text=Back up now');

    await page.fill('[placeholder="Password"]', '123456A$');
    await page.click('text=Show mnemonic');

    const mnemonic2 = await page.locator('.word > span').allTextContents();

    expect(mnemonic.join(' ')).toEqual(mnemonic2.join(' '));

    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/accounts`);
    await expect(page.locator('text=Test Account Created >> visible=true')).toBeVisible();
  });
});
