# Bubble.io E2E suite (Playwright + TypeScript)

Black-box end-to-end tests for a Bubble app, driven through the real UI with
optional Data API helpers for deterministic test data.

Target branch is set in `.env` (`BASE_URL`). Current example:
`https://elms-63577.bubbleapps.io/version-43jga`.

## Quick start

```powershell
npm install
npx playwright install chromium
Copy-Item .env.example .env   # then fill in the values
npm run typecheck
npm test
```

Useful scripts:

| Script | Purpose |
| --- | --- |
| `npm test` | Run the suite (headless, 1 worker) |
| `npm run test:headed` | Watch the browser |
| `npm run test:ui` | Playwright UI mode |
| `npm run test:debug` | Step through tests |
| `npm run codegen` | Record actions into selectors |
| `npm run report` | Open the last HTML report |
| `npm run inspect` | Dump login-page inputs/buttons/IDs to the console |
| `npm run typecheck` | `tsc --noEmit` |

## Environment variables

| Variable | Required | Notes |
| --- | --- | --- |
| `BASE_URL` | yes | App root **including branch**, e.g. `https://app.bubbleapps.io/version-test` |
| `LOGIN_PATH` | yes | Login page path, e.g. `/login_page` |
| `TEST_USER_EMAIL` / `TEST_USER_PASSWORD` | yes | App user used by the auth setup |
| `APP_USERNAME` / `APP_PASSWORD` | no | Only for Bubble **app password protection** (HTTP Basic auth) |
| `BUBBLE_API_TOKEN` | no | Settings → API → private key; enables `records.spec.ts` |
| `BUBBLE_TEST_TYPE` | no | Data type (lowercase, no spaces), e.g. `task` |
| `BUBBLE_TEST_FIELDS` | no | JSON body for the create/delete example, e.g. `{"Name":"QA"}` |

`.env` is ignored by git; commit only `.env.example`.

## Structure

```
playwright.config.ts     baseURL, auth project, reporters, timeouts
tests/
  auth.setup.ts          signs in once and saves playwright/.auth/user.json
  login.spec.ts          login page renders, valid + invalid credentials
  smoke.spec.ts          stored session reaches the authenticated app
  records.spec.ts        Data API template (skipped without a token)
pages/login.page.ts      page object with layered locators
support/
  env.ts                 typed env access
  bubble-helpers.ts      waitForBubbleReady, unique data helpers
  bubble-api.ts          Data API CRUD client
  fixtures.ts            test fixture exposing bubbleApi
scripts/inspect-page.ts  DOM dump for discovering stable selectors
```

## Bubble-specific rules

1. **Never wait for `networkidle`.** Bubble keeps a websocket open. Use
   `waitForBubbleReady()` or wait for a specific element.
2. **Prefer the Bubble "ID attribute".** Set it in the editor per element and
   use `page.getByTestId('...')`; `testIdAttribute` is configured as `id`.
   Add these for the login page: `login-email`, `login-password`,
   `login-submit`.
3. **Repeating groups.** Every cell shares the same element ID, so scope by
   content: `page.locator('[id^="task-row"]').filter({ hasText: 'QA 123' })`.
4. **Use relative navigation** (`page.goto('./')`, `page.goto('login_page')`)
   so the branch segment in `BASE_URL` is preserved.
5. **Cold starts are slow.** Timeouts are set to 60s per test. Tests share a
   single authenticated session via `storageState`.

## Bubble editor checklist (one-time)

- Confirm the branch in `BASE_URL` is the one you want to test.
- Add ID attributes to the elements the tests touch (at minimum the login
  inputs and submit button).
- If the app is password protected (HTTP Basic 401):
  **Settings → General → Password protection**; put the password in
  `APP_PASSWORD`.
- For Data API tests: **Settings → API** → enable the Data API, expose the
  data types used by tests, and generate a private key for
  `BUBBLE_API_TOKEN`. The API token has admin access, so keep it local.
- API changes and element IDs must exist in the **tested version** (use
  `version-test` or the custom branch), not only in live.

## Troubleshooting

| Symptom | Cause / fix |
| --- | --- |
| Response `401` with `WWW-Authenticate: Basic realm="<app>"` | App is password protected; set `APP_PASSWORD` |
| Blank page, empty `<body>`, `title` is empty | Same 401; the request never reaches the app |
| Login form cannot be found | Set login element IDs in the editor, or run `npm run inspect` and add selectors to `pages/login.page.ts` |
| Timeouts on navigation | Bubble cold start; rerun once or raise `navigationTimeout` |
| Tests redirect to login | Session expired or the test user has no access; delete `playwright/.auth/` and rerun |
