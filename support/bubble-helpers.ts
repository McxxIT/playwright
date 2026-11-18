import type { Page } from '@playwright/test';

/**
 * Bubble renders the page with JavaScript and keeps a websocket open, so
 * `networkidle` never settles. Wait for the body plus the optional loader
 * instead of the network.
 */
export async function waitForBubbleReady(page: Page): Promise<void> {
  await page.locator('body').waitFor({ state: 'visible' });

  // Standard Bubble page loader. Not present on every page, so ignore misses.
  await page
    .locator('#bubble-standard-loader')
    .waitFor({ state: 'hidden', timeout: 20_000 })
    .catch(() => undefined);

  // Bubble wraps most elements in .bubble-element; good readiness signal.
  await page
    .locator('.bubble-element')
    .first()
    .waitFor({ state: 'attached', timeout: 30_000 })
    .catch(() => undefined);
}

export function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function uniqueEmail(prefix = 'qa'): string {
  return `${prefix}.${uniqueSuffix()}@example.com`;
}

export function uniqueName(prefix = 'QA'): string {
  return `${prefix} ${uniqueSuffix()}`;
}
