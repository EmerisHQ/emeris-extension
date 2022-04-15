import { expect } from '@playwright/test';

export const defaultMnemonic =
  'frog radio wisdom pottery position depart machine turn seek audit tank cloth brave engine card amused napkin blossom exile gravity mesh siege fruit quick';
export const defaultCosmosAddress = 'cosmos1c7g2due09p065fnwmq8prh8wwauhy6ae8j6vu9';

export const importAccount = async (page) => {
  await page.goto(`chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`);

  // Test import
  await expect(page.locator('text=Import account >> visible=true')).toBeVisible();
  await page.click('text=Import Account >> visible=true');
  await page.fill('[placeholder="Enter a password"]', '123456A$');
  await page.fill('[placeholder="Confirm password"]', '123456A$');
  await page.click('text=Continue');

  const mnemonic = defaultMnemonic;
  await page.fill('[placeholder="Your recovery phrase"]', mnemonic);
  await page.click('[type=submit]');

  await page.fill('[placeholder="Account Name"]', 'Test Account Imported');
  await page.click('text=Continue');

  await page.click('text=Continue');
};

export const emerisLoaded = async (page) => {
  while (
    await page.evaluate(() => {
      return !window.emeris;
    })
  ) {
    await page.waitForTimeout(500);
  }
};

export const enableWebsite = async (context, page) => {
  await page.goto(`https://www.google.com/`);

  await emerisLoaded(page);

  const [popup] = await Promise.all([
    // It is important to call waitForEvent before click to set up waiting.
    context.waitForEvent('page'), // the background worker opens a new page which is the popup
    // Opens popup.
    page.evaluate(() => {
      window.emeris.enable();
    }),
  ]);
  await popup.click('text=Accept');
};
