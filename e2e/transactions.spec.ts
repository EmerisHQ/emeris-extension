/* eslint-disable max-lines-per-function */
import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { defaultCosmosAddress, emerisLoaded, enableWebsite, importAccount } from './helpers';

test.describe('Transactions', () => {
  test('Send', async ({ context, page }) => {
    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
    await importAccount(page);
    await page.goto(`https://emeris.com//`);
    await emerisLoaded(page);
    await enableWebsite(context, page);

    // when the transaction popup shows, click accept
    context.waitForEvent('page').then(async (popup) => {
      await expect(popup.locator('.total-price')).not.toHaveText('$0.00'); // fees should display
      await popup.click('text=Accept');
    });

    const result = await page.evaluate((defaultCosmosAddress) => {
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

    await expect(result).toBe(
      '0a9f010a8a010a1c2f636f736d6f732e62616e6b2e763162657461312e4d736753656e64126a0a2d636f736d6f733163376732647565303970303635666e776d713870726838777761756879366165386a36767539122d636f736d6f733163376732647565303970303635666e776d713870726838777761756879366165386a367675391a0a0a057561746f6d120131121053656e74207769746820456d6572697312690a4e0a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103addfaf462e25a64f906270d1927c7a48ec2d7859cd096ff7077459512830a35c12040a02087f12170a110a057561746f6d1208323030303030303010c09a0c1a40bd6efaa0de6dd67c7d02570f6de0acd75845ae58ce571e933d252a3e14e8c1de1bdaf072ee940bca84720dcff23c071217bb7413975431f304aba05664dda34d',
    );
  });

  test('Sign and broadcast', async ({ context, page }, testInfo) => {
    // Extend timeout for all tests running this hook by 30 seconds.
    testInfo.setTimeout(testInfo.timeout + 30000);

    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
    await importAccount(page);
    await page.goto(`https://emeris.com//`);
    await emerisLoaded(page);
    await enableWebsite(context, page);

    // when the transaction popup shows, click accept
    context.waitForEvent('page').then(async (popup) => {
      await popup.click('text=Accept');
    });

    let error;
    await page
      .evaluate((defaultCosmosAddress) => {
        return window.emeris.signAndBroadcastTransaction({
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
                amount: 2000,
                denom: 'uatom',
              },
            ],
          },
        });
      }, defaultCosmosAddress)
      .catch((err) => (error = err));

    await expect(error.message).toContain('unknown address'); // this is an error from chain showing, that the tx is relayed until the execution layer of the chain
  });
});
