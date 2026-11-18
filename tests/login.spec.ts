import { expect, test } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { env } from '../support/env';

// This file exercises the real login page, so start signed out.
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login page', () => {
  test('renders email, password and submit controls', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.expectFormVisible();
  });

  test('valid credentials sign the user in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(env.userEmail, env.userPassword);
    await expect(loginPage.passwordInput).toBeHidden();
  });

  test('wrong password does not sign the user in', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.emailInput.fill(env.userEmail);
    await loginPage.passwordInput.fill(`wrong-${Date.now()}`);
    await loginPage.submitButton.click();

    await expect(loginPage.passwordInput).toBeVisible();
  });
});
