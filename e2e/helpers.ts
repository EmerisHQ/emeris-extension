import { expect } from '@playwright/test';

export const defaultMnemonic =
  'frog radio wisdom pottery position depart machine turn seek audit tank cloth brave engine card amused napkin blossom exile gravity mesh siege fruit quick';
export const defaultCosmosAddress = 'cosmos1c7g2due09p065fnwmq8prh8wwauhy6ae8j6vu9';

export const accountCreate = async (page) => {
  // Test creation
  await expect(page.locator('text=Create Account >> visible=true')).toBeVisible();
  await page.click('text=Create Account >> visible=true');

  await page.fill('[placeholder="Enter password"]', '123456A$');
  await page.fill('[placeholder="Confirm password"]', '123456A$');
  await page.click('text=Continue');

  await page.fill('[placeholder="Surfer"]', 'Test Account Created');
  await page.click('text=Continue');
};

export const importAccount = async (page, name = 'Test Account Imported') => {
  // Test import
  await expect(page.locator('text=Import account >> visible=true')).toBeVisible();
  await page.click('text=Import Account >> visible=true');

  if (await page.$('[placeholder="Enter password"]')) {
    await page.fill('[placeholder="Enter password"]', '123456A$');
    await page.fill('[placeholder="Confirm password"]', '123456A$');
    await page.click('text=Continue');
  }
  await expect(page.locator('text=Continue')).toBeVisible();
  await page.click('text=Continue');

  const mnemonic = defaultMnemonic;
  await page.fill('[placeholder="Your recovery phrase"]', mnemonic);
  await expect(page.locator('[type=submit]')).toBeVisible();
  await page.click('[type=submit]');
  await expect(page.locator('[placeholder="Surfer"]')).toBeVisible();
  await page.fill('[placeholder="Surfer"]', name);
  await expect(page.locator('text=Continue')).toBeVisible();
  await page.click('text=Continue');
  await Promise.all([page.waitForURL('**/accountImportReady'), page.waitForNavigation()]);
};

export const emerisLoaded = async (page) => {
  await page.waitForFunction(() => !!window.hasOwnProperty('emeris'));
};

export const enableWebsite = async (context, page, withNetwork = false, isLoggedIn = false) => {
  await page.goto(`https://www.google.com/`);

  await emerisLoaded(page);

  const [popup] = await Promise.all([
    // It is important to call waitForEvent before click to set up waiting.
    context.waitForEvent('page'), // the background worker opens a new page which is the popup
    // Opens popup.
    page.evaluate((withNetwork) => {
      window.emeris.enable(withNetwork ? 'cosmoshub-4' : undefined);
    }, withNetwork),
  ]);

  if (!isLoggedIn) {
    await expect(popup.locator('[placeholder="Enter password"] >> visible=true')).toBeVisible();
    await popup.fill('[placeholder="Enter password"]', '123456A$');
    await popup.fill('[placeholder="Confirm password"]', '123456A$');
    await popup.click('text=Continue');
  }

  await popup.click('text=Accept');
  await popup.waitForEvent('close');
};

export const makeWalletReadyForRequests = async (context, page) => {
  await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);
  await importAccount(page);
  await page.waitForURL('**/accountImportReady');
  await page.goto(`https://www.google.com/`);
  await emerisLoaded(page);
  await enableWebsite(context, page, true, true);
};
