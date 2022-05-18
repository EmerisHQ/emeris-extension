/* eslint-disable max-lines-per-function */
import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { defaultCosmosAddress, emerisLoaded, makeWalletReadyForRequests } from './helpers';

test.describe('Unlocked Wallet - allowed API requests:', () => {
  test('signTransaction success', async ({ page, context }) => {
    await makeWalletReadyForRequests(context, page);

    let lastConsoleWarnMessage;
    page.on('console', (msg) => {
      lastConsoleWarnMessage = msg.text();
    });

    // when the transaction popup shows, click reject
    context.waitForEvent('page').then(async (popup) => {
      await expect(popup.locator('text=Reject')).toBeVisible();
      await popup.click('text=Reject');
    });

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
        .then((r) => {
          r;
          console.log('finished window emeris');
        });
    }, defaultCosmosAddress);

    await expect(lastConsoleWarnMessage).not.toBe(
      'Wallet not ready for requests. Please create/unlock wallet and whitelist current URL before making requests.',
    );
  });
});

test.describe('Locked Wallet - blocked API requests:', () => {
  test('signTransaction blocked', async ({ page }) => {
    await page.goto(`https://www.google.com/`);
    await emerisLoaded(page);

    let lastConsoleWarnMessage;
    page.on('console', (msg) => {
      lastConsoleWarnMessage = msg.text();
    });

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
        .then((r) => r);
    }, defaultCosmosAddress);

    await expect(lastConsoleWarnMessage).toBe(
      'Wallet not ready for requests. Please create/unlock wallet and whitelist current URL before making requests.',
    );
  });

  test('getAddress blocked', async ({ page }) => {
    await page.goto(`https://www.google.com/`);
    await emerisLoaded(page);

    let lastConsoleWarnMessage;
    page.on('console', (msg) => {
      lastConsoleWarnMessage = msg.text();
    });

    await page.evaluate(async () => {
      return window.emeris.getAddress({ chainId: 'cosmos-hub' }).then((r) => r);
    });

    await expect(lastConsoleWarnMessage).toBe(
      'Wallet not ready for requests. Please create/unlock wallet and whitelist current URL before making requests.',
    );
  });
});
