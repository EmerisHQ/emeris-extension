import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { defaultCosmosAddress, defaultMnemonic, importAccount } from './helpers';

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

    await expect(page.locator('.words')).not.toHaveText('');
    const mnemonic2 = await page.locator('.word > span').allTextContents();

    expect(mnemonic.join(' ')).toEqual(mnemonic2.join(' '));

    // test if account shows in list
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/accounts`);
    await expect(page.locator('text=Test Account Created >> visible=true')).toBeVisible();
  });

  test('Import Account', async ({ page }) => {
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
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

  test('Switch account', async ({ page, context }) => {
    async function waitForEvent(page, eventName, seconds) {

      seconds = seconds || 30;

      // use race to implement a timeout
      return Promise.race([

          // add event listener and wait for event to fire before returning
          page.evaluate(function(eventName) {
              return new Promise(function(resolve, reject) {
                  document.addEventListener(eventName, function(e) {
                      resolve(); // resolves when the event fires
                  });
              });
          }, eventName),

          // if the event does not fire within n seconds, exit
          page.waitForTimeout(seconds * 1000)
      ]);
    }
      
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
    await importAccount(page);
    await page.waitForTimeout(1 * 1000)
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/accountAddAdditional`);
    await importAccount(page, 'Test Import Account 2');
    await page.waitForTimeout(1 * 1000)
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/accounts`);

    const secondPage = await context.newPage()
    await secondPage.goto('https://www.google.com')

    // on changing the account see if the window receives the event
    await Promise.all([
      waitForEvent(secondPage, 'emeris_account_changed', 3),
      page.click('text=Test Import Account')
    ])
  })
});
