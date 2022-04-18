import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { defaultCosmosAddress, emerisLoaded, enableWebsite, importAccount } from './helpers';

test.describe('Transactions', () => {
  test('Send', async ({ context, page }) => {
    await enableWebsite(context, page);
    await importAccount(page);
    await page.goto(`https://www.google.com/`);
    await emerisLoaded(page);

    // when the transaction popup shows, click accept
    context.waitForEvent('page').then(async (popup) => {
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
              amount: 2000,
              denom: 'uatom',
            },
          ],
        },
      });
    }, defaultCosmosAddress);

    await expect(result).toBe(
      '0a9f010a8a010a1c2f636f736d6f732e62616e6b2e763162657461312e4d736753656e64126a0a2d636f736d6f733163376732647565303970303635666e776d713870726838777761756879366165386a36767539122d636f736d6f733163376732647565303970303635666e776d713870726838777761756879366165386a367675391a0a0a057561746f6d120131121053656e74207769746820456d6572697312650a4e0a460a1f2f636f736d6f732e63727970746f2e736563703235366b312e5075624b657912230a2103addfaf462e25a64f906270d1927c7a48ec2d7859cd096ff7077459512830a35c12040a02087f12130a0d0a057561746f6d12043230303010c09a0c1a40a6ef813c0a44ca631f1b5b738c30716465396012ab9d54335a8b3ba15ecf36dd7190ddc11fc52ae102918f02da411d7bebd60be8ca483ca3fec37c26f91e60cb',
    );
  });

  test('Sign and broadcast', async ({ context, page }, testInfo) => {
    // Extend timeout for all tests running this hook by 30 seconds.
    testInfo.setTimeout(testInfo.timeout + 30000);

    await enableWebsite(context, page);
    await importAccount(page);
    await page.goto(`https://www.google.com/`);
    await emerisLoaded(page);

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
