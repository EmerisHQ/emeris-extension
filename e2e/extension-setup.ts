import { chromium, test as base, webkit } from '@playwright/test';
import path from 'path';

const extensionPath = path.join(__dirname, '../dist'); // make sure this is correct

export const test = base.extend({
  context: async ({ browserName }, use) => {
    const browserTypes = { chromium, webkit };
    const launchOptions = {
      devtools: true,
      headless: false,
      viewport: {
        width: 1920,
        height: 1080,
      },
      args: [
        `--no-sandbox`,
        `--disable-setuid-sandbox`,
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
      ],
    };
    const context = await browserTypes[browserName].launchPersistentContext('', launchOptions);
    await use(context);
    await context.close();
  },
});
