import { expect, type Locator, type Page } from '@playwright/test';
import { waitForBubbleReady } from '../support/bubble-helpers';
import { env } from '../support/env';

/**
 * Page object for the Bubble login page.
 *
 * Selector order: explicit "ID attribute" set in the Bubble editor first,
 * then accessible/user-facing fallbacks. Add the IDs below in Bubble to make
 * these selectors fully deterministic:
 *   login-email, login-password, login-submit
 */
export class LoginPage {
  constructor(readonly page: Page) {}

  async goto(): Promise<void> {
    // Relative (no leading slash) so the branch segment in baseURL is kept.
    const loginPath = env.loginPath.replace(/^\/+/, '');
    await this.page.goto(loginPath);
    await waitForBubbleReady(this.page);
  }

  get emailInput(): Locator {
    return this.page
      .getByTestId('login-email')
      .or(this.page.getByTestId('email'))
      .or(this.page.locator('input[type="email"]'))
      .or(this.page.locator('input[name="email" i]'))
      .or(this.page.getByPlaceholder(/e-?mail|username/i))
      .or(this.page.getByLabel(/e-?mail|username/i))
      .first();
  }

  get passwordInput(): Locator {
    return this.page
      .getByTestId('login-password')
      .or(this.page.getByTestId('password'))
      .or(this.page.locator('input[type="password"]'))
      .or(this.page.locator('input[name="password" i]'))
      .or(this.page.getByPlaceholder(/password/i))
      .or(this.page.getByLabel(/password/i))
      .first();
  }

  get submitButton(): Locator {
    return this.page
      .getByTestId('login-submit')
      .or(this.page.getByTestId('login-btn'))
      .or(this.page.getByTestId('login-button'))
      .or(this.page.locator('#login-submit, #login-btn, #login-button'))
      .or(this.page.getByRole('button', { name: /log\s*in|sign\s*in/i }))
      .or(this.page.locator('input[type="submit"]'))
      .or(this.page.locator('[class*="Button"]').filter({ hasText: /log\s*in|sign\s*in/i }))
      .first();
  }

  async expectFormVisible(): Promise<void> {
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
    await this.waitForLoggedIn();
  }

  private async waitForLoggedIn(): Promise<void> {
    await this.page
      .waitForURL((url) => !/login/i.test(url.pathname), { timeout: 30_000 })
      .catch(async () => {
        // Stays on /login_page on failure; surface a useful assertion instead
        // of a raw timeout.
        await expect(this.passwordInput).toBeHidden({ timeout: 30_000 });
      });
  }
}
