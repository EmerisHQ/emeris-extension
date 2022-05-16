/* eslint-disable max-lines-per-function */
import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { emerisLoaded, enableWebsite } from './helpers';
import { defaultCosmosAddress, defaultMnemonic, importAccount } from './helpers';

/* eslint-disable max-lines-per-function */
test.describe('Account Create', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
  });

  test('Create Account', async ({ page }) => {
    await expect(page.locator('text=Create Account >> visible=true')).toBeVisible();
    await page.click('text=Create Account >> visible=true');
    await page.fill('[placeholder="Enter password"]', '123456A$');
    await page.fill('[placeholder="Confirm password"]', '123456A$');
    await page.click('text=Continue');

    await page.fill('[placeholder="Surfer"]', 'Test Account Created');
    await page.click('text=Continue');

    await page.click('text=Show secret recovery phrase');

    await page.fill('[placeholder="Password"]', '123456A$');
    await page.click('text=Show mnemonic');

    await page.click('text=Back up later');
    await page.click('text=I understand');
    await page.click('text=Continue');

    await expect(page.locator('text=Test Account Created >> visible=true')).toBeVisible();
  });

  test('Create Account with backup', async ({ page }) => {
    // Test creation
    await expect(page.locator('text=Create Account >> visible=true')).toBeVisible();
    await page.click('text=Create Account >> visible=true');

    await page.fill('[placeholder="Enter password"]', '123456A$');
    await page.fill('[placeholder="Confirm password"]', '123456A$');
    await page.click('text=Continue');

    await page.fill('[placeholder="Surfer"]', 'Test Account Created');
    await page.click('text=Continue');

    // test backing up
    await page.click('text=Show secret recovery phrase');

    await page.fill('[placeholder="Password"]', '123456A$');
    await page.click('text=Show mnemonic');

    // TODO there is a delay in the background until the wallet is available
    while (await page.isVisible('text=Incorrect word, try again.')) {
      await page.waitForTimeout(500);
      await page.click('text=Show mnemonic');
    }

    await expect(page.locator('.word:first-child >> visible=true')).toBeVisible();
    const mnemonic = await page.locator('.word').allTextContents();
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

    await page.click('text=Show secret recovery phrase');

    await page.fill('[placeholder="Password"]', '123456A$');
    await page.click('text=Show mnemonic');

    await expect(page.locator('.words')).not.toHaveText('');
    const mnemonic2 = await page.locator('.word').allTextContents();

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

    await page.click('text=Show secret recovery phrase');

    await page.fill('[placeholder="Password"]', '123456A$');
    await page.click('text=Show mnemonic');

    await expect(page.locator('.words')).not.toHaveText('');
    const mnemonic2 = await page.locator('.word').allTextContents();

    expect(defaultMnemonic).toEqual(mnemonic2.join(' '));

    // test if account shows in list
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/accounts`);
    await expect(page.locator('text=Test Account Imported >> visible=true')).toBeVisible();
  });

  test.describe('Cannot Import Account', () => {
    let mnemonic = '';

    test.beforeEach(async ({ page }) => {
      await expect(page.locator('text=Import account >> visible=true')).toBeVisible();
      await page.click('text=Import Account >> visible=true');

      if (await page.$('[placeholder="Enter password"]')) {
        await page.fill('[placeholder="Enter password"]', '123456A$');
        await page.fill('[placeholder="Confirm password"]', '123456A$');
        await page.click('text=Continue');
      }

      await page.click('text=Continue');
    });

    test.afterEach(async ({ page }) => {
      const importButtonDisabled = await page.locator('button', { hasText: 'Import' }).isDisabled();
      await expect(importButtonDisabled).toBeTruthy();
    });

    test('Should enter only correct words in the mnemonic', async ({ page }) => {
      mnemonic = 'rilld';
      await page.fill('[placeholder="Your recovery phrase"]', mnemonic);
      await expect(page.locator('text=Unknown words found: rilld >> visible=true')).toBeVisible();
    });

    test('Should enter enough words in the mnemonic', async ({ page }) => {
      mnemonic = 'drill question cream love depart sort blast nose';
      await page.fill('[placeholder="Your recovery phrase"]', mnemonic);
    });

    test('Should enter enough words in the mnemonic and be valid (exist)', async ({ page }) => {
      mnemonic = 'drill question cream love depart sort nose blast brown master other thunder fabric';
      await page.fill('[placeholder="Your recovery phrase"]', mnemonic);
      await expect(page.locator('text=Invalid secret recovery phrase >> visible=true')).toBeVisible();
    });
  });

  test('Switch account', async ({ page, context }) => {
    async function waitForEvent(page, eventName, seconds) {
      seconds = seconds || 30;

      // use race to implement a timeout
      return Promise.race([
        // add event listener and wait for event to fire before returning
        page.evaluate((eventName) => {
          return new Promise<void>((resolve) => {
            document.addEventListener(eventName, () => {
              resolve(); // resolves when the event fires
            });
          });
        }, eventName),

        // if the event does not fire within n seconds, exit
        page.waitForTimeout(seconds * 1000),
      ]);
    }

    await importAccount(page);
    await page.waitForTimeout(1 * 1000);
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/accountAddAdditional`);
    await importAccount(page, 'Test Import Account 2');
    await page.waitForTimeout(1 * 1000);
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true#/accounts`);

    const secondPage = await context.newPage();
    await secondPage.goto('https://www.google.com');

    // on changing the account see if the window receives the event
    await Promise.all([waitForEvent(secondPage, 'emeris_account_changed', 3), page.click('text=Test Import Account')]);
  });

  test('Get active account', async ({ page, context }) => {
    await enableWebsite(context, page);
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
    await importAccount(page);
    await page.goto(`https://www.google.com/`);
    await emerisLoaded(page);

    expect(
      await page.evaluate(() => {
        return window.emeris.getActiveAccount('cosmoshub-4');
      }),
    ).toStrictEqual({
      address: {
        '0': 199,
        '1': 144,
        '10': 216,
        '11': 14,
        '12': 17,
        '13': 220,
        '14': 238,
        '15': 119,
        '16': 121,
        '17': 114,
        '18': 107,
        '19': 185,
        '2': 166,
        '3': 243,
        '4': 47,
        '5': 40,
        '6': 95,
        '7': 170,
        '8': 38,
        '9': 110,
      },
      algo: 'secp256k1',
      bech32Address: 'cosmos1c7g2due09p065fnwmq8prh8wwauhy6ae8j6vu9',
      name: 'Test Account Imported',
      pubKey: {
        '0': 3,
        '1': 173,
        '10': 98,
        '11': 112,
        '12': 209,
        '13': 146,
        '14': 124,
        '15': 122,
        '16': 72,
        '17': 236,
        '18': 45,
        '19': 120,
        '2': 223,
        '20': 89,
        '21': 205,
        '22': 9,
        '23': 111,
        '24': 247,
        '25': 7,
        '26': 116,
        '27': 89,
        '28': 81,
        '29': 40,
        '3': 175,
        '30': 48,
        '31': 163,
        '32': 92,
        '4': 70,
        '5': 46,
        '6': 37,
        '7': 166,
        '8': 79,
        '9': 144,
      },
    });
  });
});
