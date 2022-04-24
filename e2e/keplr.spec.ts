import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { defaultCosmosAddress, emerisLoaded, enableWebsite, importAccount } from './helpers';

test.describe('Keplr', () => {
  test('OfflineSigner', async ({ context, page }) => {
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
  
  test('Get accounts', async ({ context, page }) => {
    await enableWebsite(context, page);
    await importAccount(page);
    await page.goto(`https://www.google.com/`);
    await emerisLoaded(page);

    // when the transaction popup shows, click accept
    context.waitForEvent('page').then(async (popup) => {
      await popup.click('text=Accept');
    });

    const result = await page.evaluate(() => {
      return window.emeris.keplr.getOfflineSigner().getAccounts();
    });

    await expect(result).toStrictEqual([{
         "address": "c790a6f32f285faa266ed80e11dcee7779726bb91ps5g9lwx",
         "algo": "secp256k1",
         "pubkey": {
           "0": 3,
           "1": 173,
           "10": 98,
           "11": 112,
           "12": 209,
           "13": 146,
           "14": 124,
           "15": 122,
           "16": 72,
           "17": 236,
           "18": 45,
           "19": 120,
           "2": 223,
           "20": 89,
           "21": 205,
           "22": 9,
           "23": 111,
           "24": 247,
           "25": 7,
           "26": 116,
           "27": 89,
           "28": 81,
           "29": 40,
           "3": 175,
           "30": 48,
           "31": 163,
           "32": 92,
           "4": 70,
           "5": 46,
           "6": 37,
           "7": 166,
           "8": 79,
           "9": 144,
         },
    }]);
  });
});
