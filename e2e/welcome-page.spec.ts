import { expect, test } from './extension-setup';

test.describe('Welcome page', () => {
    test('Loader shows', async ({ page }) => {
        await page.goto(
            `chrome-extension://${process.env.EXTENSION_ID}/popup.html?browser=true`
        )
        await page.waitForSelector('.ephemeris');
    });
});