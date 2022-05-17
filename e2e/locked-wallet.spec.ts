/* eslint-disable max-lines-per-function */
import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { defaultCosmosAddress, emerisLoaded, makeReadyForRequests } from './helpers';

test.describe('Unlocked Wallet - attempt API requests:', () => {
  test('signTransaction', async ({ page, context }) => {
    await makeReadyForRequests(context, page);

    let lastConsoleWarnMessage;
    page.on('console', (msg) => {
      lastConsoleWarnMessage = msg.text();
    });

    await page.evaluate(async (defaultCosmosAddress) => {
      console.log('started window emeris');
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
        })
        .catch((e) => console.log(e));
    }, defaultCosmosAddress);

    // await expect(page.textContent('body')).toContain('reject');
    await expect(lastConsoleWarnMessage).not.toBe(
      'Wallet locked or not yet created. Please create/unlock wallet before making requests.',
    );
  });
});

test.describe('Locked Wallet - attempt API requests:', () => {
  test('signTransaction', async ({ page }) => {
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
      'Wallet locked or not yet created. Please create/unlock wallet before making requests.',
    );
  });

  test('getAddress', async ({ page }) => {
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
      'Wallet locked or not yet created. Please create/unlock wallet before making requests.',
    );
  });
});
