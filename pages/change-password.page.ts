import { expect, type Locator, type Page } from '@playwright/test';
import { waitForBubbleReady } from '../support/bubble-helpers';

export type PasswordRowName = 'current' | 'new' | 'verify';
export const PASSWORD_ROWS: readonly PasswordRowName[] = ['current', 'new', 'verify'];

export interface PasswordRow {
  group: Locator;
  masked: Locator;
  plain: Locator;
  toggle: Locator;
  icon: Locator;
}

/**
 * Page object for institution_page/change-password (Bubble branch version-13p0j).
 *
 * Read-only by design: there is deliberately NO submit-button locator, so a
 * spec cannot change the shared test user's password by accident.
 *
 * Bubble IDs per row (<name> = current | new | verify):
 *   group-<name>-password, input-<name>-password,
 *   input-<name>-password-plain, toggle-<name>-password
 *
 * The plain input is absent at load, created on first toggle and hidden
 * (display:none) after re-masking. Assert it with toBeHidden(), never
 * toHaveCount(0).
 */
export class ChangePasswordPage {
  constructor(readonly page: Page) {}

  async goto(): Promise<void> {
    // Relative (no leading slash) so the branch segment in baseURL is kept.
    await this.page.goto('institution_page/change-password');
    await waitForBubbleReady(this.page);
    await expect(
      this.row('current').group,
      'group-current-password not found: this spec needs Bubble branch version-13p0j (set BASE_URL to /version-13p0j)',
    ).toBeVisible();
  }

  row(name: PasswordRowName): PasswordRow {
    const group = this.page.getByTestId(`group-${name}-password`);
    const toggle = this.page.getByTestId(`toggle-${name}-password`);
    return {
      group,
      masked: this.page
        .getByTestId(`input-${name}-password`)
        .or(group.locator('input[type="password"]'))
        .first(),
      // Lazy locator: safe while the element does not exist yet.
      plain: this.page.getByTestId(`input-${name}-password-plain`),
      toggle,
      icon: toggle.locator('use'),
    };
  }

  /** Click the row's toggle and wait for the swap in the stated direction. */
  async toggle(name: PasswordRowName, to: 'plain' | 'masked'): Promise<void> {
    const row = this.row(name);
    await row.toggle.click();
    await expect(to === 'plain' ? row.plain : row.masked).toBeVisible();
  }
}
