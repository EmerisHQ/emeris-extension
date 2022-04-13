import { expect } from '@playwright/test';

import { test } from './extension-setup';

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

    const mnemonic2 = await page.locator('.word > span').allTextContents();

    expect(mnemonic.join(' ')).toEqual(mnemonic2.join(' '));

    // test if account shows in list
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/accounts`);
    await expect(page.locator('text=Test Account Created >> visible=true')).toBeVisible();
  });

  test('Import Account', async ({ page }) => {
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);

    // Test import
    await expect(page.locator('text=Import account >> visible=true')).toBeVisible();
    await page.click('text=Import Account >> visible=true');
    await page.fill('[placeholder="Enter a password"]', '123456A$');
    await page.fill('[placeholder="Confirm password"]', '123456A$');
    await page.click('text=Continue');

    const mnemonic =
      'frog radio wisdom pottery position depart machine turn seek audit tank cloth brave engine card amused napkin blossom exile gravity mesh siege fruit quick';
    await page.fill('[placeholder="Your recovery phrase"]', mnemonic);
    await page.click('[type=submit]');

    await page.fill('[placeholder="Account Name"]', 'Test Account Imported');
    await page.click('text=Continue');

    await page.click('text=Continue');

    await expect(page.locator('text=Get started by funding your wallet >> visible=true')).toBeVisible();

    // test if address shows correctly
    await page.click('text=Receive assets');
    await page.click('text=Atom');
    await expect(page.locator('text=cosmos1')).toHaveText('cosmos1c7g2due09p065fnwmq8prh8wwauhy6ae8j6vu9');

    // test if seed shows correctly
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/backup`);

    await page.click('text=Back up now');

    await page.fill('[placeholder="Password"]', '123456A$');
    await page.click('text=Show mnemonic');

    const mnemonic2 = await page.locator('.word > span').allTextContents();

    expect(mnemonic).toEqual(mnemonic2.join(' '));

    // test if account shows in list
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/accounts`);
    await expect(page.locator('text=Test Account Imported >> visible=true')).toBeVisible();
  });
});
