import { expect } from '@playwright/test';

import { test } from './extension-setup';
import { defaultCosmosAddress, emerisLoaded, importAccount } from './helpers';

export const enableWebsite = async (context, page) => {
  await page.goto(`https://www.google.com/`);

  await emerisLoaded(page);

  const [popup] = await Promise.all([
    // It is important to call waitForEvent before click to set up waiting.
    context.waitForEvent('page'), // the background worker opens a new page which is the popup
    // Opens popup.
    page.evaluate(() => {
      window.emeris.keplr.enable('cosmoshub-4');
    }),
  ]);
  await popup.click('text=Accept');
};

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
      return window.emeris.keplr.getOfflineSigner('cosmoshub-4').signAmino(defaultCosmosAddress, {
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
        signature: '+6+47lgYWBTYuU9Sww9ZGuy5pMvhmPrVDEByqx8wt7xLs537BGfdos3+ObPKFyYEZgOvIvT7dFIjbDhbNDh6ZQ==',
      },
      signed: {
        account_number: '0',
        chain_id: 'cosmoshub-4',
        fee: { amount: [{ amount: '1000', denom: 'uatom' }], gas: '200000' },
        memo: 'Sent with Emeris',
        msgs: [
          {
            type: 'cosmos-sdk/MsgSend',
            value: {
              amount: [
                {
                  amount: '1',
                  denom: 'uatom',
                },
              ],
              from_address: 'cosmos1c7g2due09p065fnwmq8prh8wwauhy6ae8j6vu9',
              to_address: 'cosmos1c7g2due09p065fnwmq8prh8wwauhy6ae8j6vu9',
            },
          },
        ],
        sequence: '0',
        msgs: [
          {
            type: 'cosmos-sdk/MsgSend',
            value: {
              amount: [
                {
                  amount: '1',
                  denom: 'uatom',
                },
              ],
              from_address: 'cosmos1c7g2due09p065fnwmq8prh8wwauhy6ae8j6vu9',
              to_address: 'cosmos1c7g2due09p065fnwmq8prh8wwauhy6ae8j6vu9',
            },
          },
        ],
      },
    });
  });

  test('Get accounts', async ({ context, page }) => {
    await enableWebsite(context, page);
    await importAccount(page);
    await page.goto(`https://www.google.com/`);
    await emerisLoaded(page);

    const result = await page.evaluate(() => {
      return window.emeris.keplr.getOfflineSigner('cosmoshub-4').getAccounts();
    });

    await expect(result).toStrictEqual([
      {
        address: 'cosmos1c7g2due09p065fnwmq8prh8wwauhy6ae8j6vu9',
        algo: 'secp256k1',
        pubkey: {
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
      },
    ]);
  });

  test('Request page whitelisting', async ({ page, context }) => {
    await page.goto(`https://www.google.com/`);
    await emerisLoaded(page);

    // negative test
    expect(
      await page.evaluate(() => {
        return window.emeris.supportedChains();
      }),
    ).toBe(false); // TODO the response should be a thrown error imo

    await enableWebsite(context, page);

    // positive test
    expect(
      async () =>
        await page.evaluate(() => {
          return window.emeris.supportedChains();
        }),
    ).not.toBe(false);

    await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html#/whitelisted?browser=true`);
    await expect(page.locator('text=https://www.google.com').first()).toBeVisible();

    // disconnect page
    await page.click('text=disconnect');
    await page.click('text=Remove');

    // check if disconnected
    await expect(page.locator('text=https://www.google.com')).not.toBeVisible();
    await page.goto(`https://www.google.com`);
    await emerisLoaded(page);
    expect(
      await page.evaluate(() => {
        return window.emeris.supportedChains();
      }),
    ).toBe(false); // TODO the response should be a thrown error imo
  });
});
