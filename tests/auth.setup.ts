import fs from 'node:fs';
import path from 'node:path';
import { expect, test as setup } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { env } from '../support/env';

const authFile = 'playwright/.auth/user.json';

setup('authenticate as the test user', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await expect(loginPage.emailInput).toBeVisible();

  await loginPage.login(env.userEmail, env.userPassword);

  // A signed-in session must no longer show the password field.
  await expect(loginPage.passwordInput).toBeHidden();

  fs.mkdirSync(path.dirname(authFile), { recursive: true });
  await page.context().storageState({ path: authFile });
});
