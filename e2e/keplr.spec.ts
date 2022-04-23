import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { defaultCosmosAddress, emerisLoaded, enableWebsite, importAccount } from './helpers';

test.describe('Keplr', () => {
  test('OfflineSigner', async ({ context, page }, testInfo) => {
    // Extend timeout for all tests running this hook by 30 seconds.
    testInfo.setTimeout(testInfo.timeout + 60000);

    await enableWebsite(context, page);
    await importAccount(page);
    await page.goto(`https://www.google.com/`);
    await emerisLoaded(page);

    // when the transaction popup shows, click accept
    context.waitForEvent('page').then(async (popup) => {
      await popup.click('text=Accept');
    });

    const result = await page.evaluate((defaultCosmosAddress) => {
      return window.emeris.keplr.getOfflineSigner().signAmino(defaultCosmosAddress, {
        chain_id: 'cosmoshub-4',
        account_number: '0',
        sequence: '0',
        fee: { gas: 200000, amount: [{ amount: 1000, denom: 'uatom' }] },
        msgs: [
          {
            type: 'cosmos-sdk/MsgSend',
            value: {
              from_address: defaultCosmosAddress,
              to_address: defaultCosmosAddress,
              amount: [{ amount: '1', denom: 'uatom' }],
            },
          },
        ],
        memo: 'Sent with Emeris',
      });
    }, defaultCosmosAddress);

    await expect(result).toStrictEqual({
      signature: {
        pub_key: { type: 'tendermint/PubKeySecp256k1', value: 'A63fr0YuJaZPkGJw0ZJ8ekjsLXhZzQlv9wd0WVEoMKNc' },
        signature: 'hacmpAXkWAC5h/DvJ7U/1dFABxwDZfoY12M/o6CaOqMFqdAqKPOrQGuYz26cX5E4hGObFETADSCD9ayGKoLnSQ==',
      },
      signed: {
        account_number: '0',
        chain_id: 'cosmoshub-4',
        fee: { amount: [{ amount: '1000', denom: 'uatom' }], gas: '200000' },
        memo: 'Sent with Emeris',
        sequence: '0',
      },
    });
  });
});
