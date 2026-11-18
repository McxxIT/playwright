import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { waitForBubbleReady } from '../support/bubble-helpers';
import { env } from '../support/env';

test.describe('Authenticated app shell', () => {
  test('stored session opens the app without a login prompt', async ({ page }) => {
    await page.goto('./');
    await waitForBubbleReady(page);

    const loginPage = new LoginPage(page);
    await expect(loginPage.passwordInput).toBeHidden();

    const bodyText = (await page.locator('body').innerText()).trim();
    expect(bodyText.length, 'the authenticated page should render visible content').toBeGreaterThan(0);
  });

  test('root url keeps the branch segment', async ({ page }) => {
    await page.goto('./');
    await waitForBubbleReady(page);

    const branch = new URL(env.baseUrl).pathname.replace(/^\//, '');
    if (branch) {
      expect(new URL(page.url()).pathname).toContain(branch);
    }
  });
});
