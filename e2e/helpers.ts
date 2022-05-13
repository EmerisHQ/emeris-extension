import { expect } from '@playwright/test';

export const defaultMnemonic =
  'frog radio wisdom pottery position depart machine turn seek audit tank cloth brave engine card amused napkin blossom exile gravity mesh siege fruit quick';
export const defaultCosmosAddress = 'cosmos1c7g2due09p065fnwmq8prh8wwauhy6ae8j6vu9';

export const importAccount = async (page, name = 'Test Account Imported') => {
  // Test import
  await expect(page.locator('text=Import account >> visible=true')).toBeVisible();
  await page.click('text=Import Account >> visible=true');

  if (await page.$('[placeholder="Enter password"]')) {
    await page.fill('[placeholder="Enter password"]', '123456A$');
    await page.fill('[placeholder="Confirm password"]', '123456A$');
    await page.click('text=Continue');
  }

  await page.click('text=Continue');

  const mnemonic = defaultMnemonic;
  await page.fill('[placeholder="Your recovery phrase"]', mnemonic);
  await page.click('[type=submit]');

  await page.waitForTimeout(500); // needed as the view overwrite the input on load
  await page.fill('[placeholder="Surfer"]', name);
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

// TODO refactor both functions
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

  await expect(popup.locator('[placeholder="Enter a password"] >> visible=true')).toBeVisible();
  await popup.fill('[placeholder="Enter a password"]', '123456A$');
  await popup.fill('[placeholder="Confirm password"]', '123456A$');
  await popup.click('text=Continue');

  await popup.click('text=Accept');
};

export const keplrEnableWebsite = async (context, page) => {
  await page.goto(`https://www.google.com/`);

  await emerisLoaded(page);

  const [popup] = await Promise.all([
    // It is important to call waitForEvent before click to set up waiting.
    context.waitForEvent('page'), // the background worker opens a new page which is the popup
    // Opens popup.
    page.evaluate(() => {
      window.emeris.enable('cosmos-hub');
    }),
  ]);

  await expect(popup.locator('[placeholder="Enter a password"] >> visible=true')).toBeVisible();
  await popup.fill('[placeholder="Enter a password"]', '123456A$');
  await popup.fill('[placeholder="Confirm password"]', '123456A$');
  await popup.click('text=Continue');

  await expect(popup.locator('text=Accept >> visible=true')).toBeVisible();
  await popup.click('text=Accept');
};
