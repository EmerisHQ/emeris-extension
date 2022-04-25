/* eslint-disable max-lines-per-function */
import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { defaultCosmosAddress, defaultMnemonic, importAccount } from './helpers';

/* eslint-disable max-lines-per-function */
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

    // Test creation
    await expect(page.locator('text=Create Account >> visible=true')).toBeVisible();
    await page.click('text=Create Account >> visible=true');

    await page.fill('[placeholder="Enter a password"]', '123456A$');
    await page.fill('[placeholder="Confirm password"]', '123456A$');
    await page.click('text=Continue');

    await page.fill('[placeholder="Account Name"]', 'Test Account Created');
    await page.click('text=Continue');

    // test backing up
    await page.click('text=Back up now');

    await page.fill('[placeholder="Password"]', '123456A$');
    await page.click('text=Show mnemonic');

    // TODO there is a delay in the background until the wallet is available
    while (await page.isVisible('text=Incorrect word. Try again.')) {
      await page.waitForTimeout(500);
      await page.click('text=Show mnemonic');
    }

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

    // test if seed shows correctly
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/backup`);

    await page.click('text=Back up now');

    await page.fill('[placeholder="Password"]', '123456A$');
    await page.click('text=Show mnemonic');

    await expect(page.locator('.words')).not.toHaveText('');
    const mnemonic2 = await page.locator('.word > span').allTextContents();

    expect(mnemonic.join(' ')).toEqual(mnemonic2.join(' '));

    // test if account shows in list
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/accounts`);
    await expect(page.locator('text=Test Account Created >> visible=true')).toBeVisible();
  });

  test('Import Account', async ({ page }) => {
    await importAccount(page);

    await expect(page.locator('text=Get started by funding your wallet >> visible=true')).toBeVisible();

    // test if address shows correctly
    await page.click('text=Receive assets');
    await page.click('text=Atom');
    await expect(page.locator('text=cosmos1')).toHaveText(defaultCosmosAddress);

    // test if seed shows correctly
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/backup`);

    await page.click('text=Back up now');

    await page.fill('[placeholder="Password"]', '123456A$');
    await page.click('text=Show mnemonic');

    await expect(page.locator('.words')).not.toHaveText('');
    const mnemonic2 = await page.locator('.word > span').allTextContents();

    expect(defaultMnemonic).toEqual(mnemonic2.join(' '));

    // test if account shows in list
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/accounts`);
    await expect(page.locator('text=Test Account Imported >> visible=true')).toBeVisible();
  });
});
