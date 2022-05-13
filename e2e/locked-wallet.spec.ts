/* eslint-disable max-lines-per-function */
import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { defaultCosmosAddress, emerisLoaded } from './helpers';

test.describe('Locked Wallet - attempt operations:', () => {
  test.only('signTransaction', async ({ page }) => {
    await page.goto(`https://www.google.com/`);
    await emerisLoaded(page);

    let lastConsoleWarnMessage;
    page.on('console', (msg) => {
      lastConsoleWarnMessage = msg.text();
    });

    // context.waitForEvent('page').then(async (popup) => {
    // should show  create account page
    // await page.pause();
    // await expect(popup.locator('button:has-text("Create Account")')).toHaveCount(0);
    // await expect(popup.locator('button:has-text("Create Account")')).toHaveText(/Create Account/);
    // await popup.close();
    // await expect(popup.locator('[data-testid=unlock-emeris-btn]')).toHaveText('Create Account');

    // login
    // await importAccount(popup);

    // // then should show whitelist page
    // await popup.click('text=Accept');

    // // reject transaction
    // // await popup.click('text=Reject');
    // await popup.locator('button:has-text("Reject")').click();
    // // await popup.close();
    // return;
    // });

    await page.evaluate(async (defaultCosmosAddress) => {
      return window.emeris
        .signTransaction({
          chainId: 'cosmos-hub',
          signingAddress: defaultCosmosAddress,
          messages: [
            {
              type: 'transfer',
              data: {
                amount: { denom: 'uatom', amount: 1 },
                chain_name: 'cosmos-hub',
                from_address: defaultCosmosAddress,
                to_address: defaultCosmosAddress,
              },
            },
          ],
          fee: {
            gas: '200000',
            amount: [
              {
                amount: 20000000,
                denom: 'uatom',
              },
            ],
          },
        })
        .then((r) => r)
        .catch((e) => e);
    }, defaultCosmosAddress);

    await expect(lastConsoleWarnMessage).toBe(
      'Wallet locked or not yet created. Please create/unlock wallet before making requests.',
    );
  });

  // test('getOfflineSigner', async ({ page, context }) => {
  //   await page.goto(`https://www.google.com/`);
  //   await emerisLoaded(page);

  //   let lastConsoleWarnMessage;
  //   page.on('console', (msg) => {
  //     lastConsoleWarnMessage = msg.text();
  //   });

  //   // when the transaction popup shows, click accept
  //   context.waitForEvent('page').then(async (popup) => {
  //     // should show popup requesting password
  //     // expect();
  //     // await popup.click('text=Accept');
  //   });

  //   await page.evaluate(() => {
  //     return window.emeris.getOfflineSigner('cosmoshub-4');
  //   });

  //   await expect(lastConsoleWarnMessage).toBe('Wallet locked. Add password to get offline signer.');
  // });
});
