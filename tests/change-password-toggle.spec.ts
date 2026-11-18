import { expect, test } from '@playwright/test';
import { ChangePasswordPage, PASSWORD_ROWS, type PasswordRowName } from '../pages/change-password.page';
import { uniqueName } from '../support/bubble-helpers';

// Read-only: the form is never submitted. Only the 3 toggles are clicked.
// Requires Bubble branch version-13p0j (BASE_URL).

async function expectMasked(cp: ChangePasswordPage, name: PasswordRowName): Promise<void> {
  const row = cp.row(name);
  await expect(row.masked, `${name}: masked input visible`).toBeVisible();
  await expect(row.masked).toHaveAttribute('type', 'password');
  await expect(row.plain, `${name}: plain input hidden`).toBeHidden();
  await expect(row.toggle, `${name}: toggle visible`).toBeVisible();
  await expect(row.icon, `${name}: icon is eye-off`).toHaveAttribute('href', /#eye-off$/);
}

test.describe('Change password show/hide toggles', () => {
  let cp: ChangePasswordPage;

  test.beforeEach(async ({ page }) => {
    cp = new ChangePasswordPage(page);
    await cp.goto();
  });

  test('S1 all rows start masked with eye-off icon', async () => {
    for (const name of PASSWORD_ROWS) await expectMasked(cp, name);
  });

  test('S2 unmask shows the typed value and eye icon', async () => {
    for (const name of PASSWORD_ROWS) {
      const row = cp.row(name);
      const value = uniqueName('Pw');
      await row.masked.fill(value);
      await cp.toggle(name, 'plain');
      // Bubble renders type="input" (invalid); the browser normalizes the property to "text".
      await expect(row.plain).toHaveJSProperty('type', 'text');
      await expect.soft(row.plain, `${name}: plain input should hold the typed value`).toHaveValue(value);
      await expect(row.masked).toBeHidden();
      await expect(row.icon, `${name}: icon is eye`).toHaveAttribute('href', /#eye$/);
    }
  });

  test('S3 re-mask keeps the value and restores eye-off icon', async () => {
    for (const name of PASSWORD_ROWS) {
      const row = cp.row(name);
      const value = uniqueName('Pw');
      await row.masked.fill(value);
      await cp.toggle(name, 'plain');
      await cp.toggle(name, 'masked');
      await expect.soft(row.masked, `${name}: masked input should keep the value after re-masking`).toHaveValue(value);
      await expect(row.plain).toBeHidden();
      await expect(row.icon, `${name}: icon is eye-off`).toHaveAttribute('href', /#eye-off$/);
    }
  });

  for (const toggled of PASSWORD_ROWS) {
    test(`S4 toggling ${toggled} leaves others masked`, async () => {
      await cp.toggle(toggled, 'plain');
      await expect(cp.row(toggled).icon).toHaveAttribute('href', /#eye$/);
      for (const other of PASSWORD_ROWS.filter((n) => n !== toggled)) {
        await expectMasked(cp, other);
      }
    });
  }

  test('S5 edits in the plain input survive re-masking', async () => {
    for (const name of PASSWORD_ROWS) {
      const row = cp.row(name);
      await row.masked.fill(uniqueName('Pw'));
      await cp.toggle(name, 'plain');
      const edited = uniqueName('Edited');
      // Edit like a real user: clear, type key by key, then blur with Tab so Bubble
      // commits the value on change/blur. Never Enter/Space (focus may be on the toggle).
      await row.plain.clear();
      await row.plain.pressSequentially(edited);
      await row.plain.press('Tab');
      await expect(row.plain).not.toBeFocused();
      await expect(row.plain).toHaveValue(edited);
      // No DOM signal marks Bubble's post-blur value commit; short documented settle (<=1s).
      await cp.page.waitForTimeout(500);
      await cp.toggle(name, 'masked');
      await expect
        .soft(row.masked, `${name}: PRODUCT DEFECT if failing - plain-input edit not synced back to masked input`)
        .toHaveValue(edited);
    }
  });
});
