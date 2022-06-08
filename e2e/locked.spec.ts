/* eslint-disable max-lines-per-function */
import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { defaultCosmosAddress, emerisLoaded, importAccount } from './helpers';

test.describe('Wallet not ready', () => {
  test('Not created - Sign Transaction', async ({ page }) => {
    await page.goto(`https://emeris.com`);
    await emerisLoaded(page);

    let errorMessage = '';
    try {
      await page.evaluate(async (defaultCosmosAddress) => {
        return window.emeris.signTransaction({
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
        });
      }, defaultCosmosAddress);
    } catch (e) {
      errorMessage = e.message;
    }
    expect(errorMessage).toContain('Wallet has not yet been created.');
  });

  test('Created, unlocked, but not whitelisted - Sign Transaction', async ({ page }) => {
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
    await importAccount(page);

    await page.goto(`https://emeris.com`);
    await emerisLoaded(page);

    let errorMessage = '';
    try {
      await page.evaluate(async (defaultCosmosAddress) => {
        return window.emeris.signTransaction({
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
        });
      }, defaultCosmosAddress);
    } catch (e) {
      errorMessage = e.message;
    }
    expect(errorMessage).toContain('Website has not been whitelisted.');
  });
});
