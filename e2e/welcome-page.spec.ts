import { test } from './extension-setup';

test.describe('Welcome page', () => {
  test('Loader shows', async ({ page }) => {
    await page.goto(`https://www.google.de`);
    await page.waitForSelector('.ephemeris');
  });
});
