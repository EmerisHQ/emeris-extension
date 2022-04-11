import { test } from './extension-setup';

test.describe('Welcome page', () => {
  test('Loader shows', async ({ page }) => {
    await page.goto(`www.google.de`);
    await page.waitForSelector('.ephemeris');
  });
});
