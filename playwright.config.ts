import 'dotenv/config';
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL;
if (!baseURL) {
  throw new Error('BASE_URL is missing. Copy .env.example to .env and set it.');
}

// Keep the branch segment when resolving relative paths (e.g. /version-test/).
const baseURLWithSlash = `${baseURL.replace(/\/+$/, '')}/`;

const authFile = 'playwright/.auth/user.json';

// Bubble's "Password protection" (Settings > General) uses HTTP Basic auth.
const appPassword = process.env.APP_PASSWORD;
const httpCredentials = appPassword
  ? { username: process.env.APP_USERNAME || 'bubble', password: appPassword }
  : undefined;

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  forbidOnly: !!process.env.CI,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: baseURLWithSlash,
    // Bubble exposes an "ID attribute" per element; reuse it as the test-id.
    testIdAttribute: 'id',
    httpCredentials,
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
    },
  ],
});
