---
name: context:all-tests
description: "Running, writing, or debugging Playwright specs against Bubble — the tests group entrypoint/router"
keywords: tests, playwright, e2e, spec, page object, locator, selector, flaky, timeout, auth, storagestate, bubble, data api, seeding, typecheck, ci
related: []
date: 18-11-26
---

# bubble-playwright-e2e - All Tests

Last updated: 18-11-26 (vc-setup STUDY)

Attach this file first when the task involves testing, verification, or test debugging.

Do not load the whole `process/context/tests/` folder by default. Start here, then drill down.

---

## Scope

This group covers:

- the Playwright runner, projects, and commands
- writing specs and page objects against Bubble UI
- Bubble-specific selector, hydration, repeating-group, and popup patterns
- Data API seeding/cleanup for tests
- debugging failing/flaky tests

It does not cover:

- feature-specific test plans (those live in `process/features/{area}/`)
- plan-shape calibration (that's `planning/`)

## Read When

- running tests after any change
- writing a new spec or page object
- debugging a failing, flaky, or timing-out test
- seeding or cleaning up data via the Data API

## Quick Routing

| If you need... | Read next |
|---|---|
| Bubble selectors, hydration waits, repeating groups, popups, forms | `process/context/tests/bubble-patterns.md` |
| env vars, editor checklist, troubleshooting table | `README.md` (repo root) |
| Data API client surface | `support/bubble-api.ts`, template in `tests/records.spec.ts` |

## Quick Decision Guide

There is one runner: **Playwright** (`@playwright/test` 1.65.1, Chromium). There are no unit tests — the system under test is a deployed Bubble app.

- **`npm run typecheck`** — always first; the only static check (no linter).
- **Single spec / single test** — the normal verification loop while developing.
- **`--no-deps`** — when iterating on a signed-in spec and `playwright/.auth/user.json` is still valid; skips the login setup project.
- **Full `npm test`** — before declaring a task done.
- **`npm run inspect`** — when a selector can't be found; dumps what the page actually renders (currently hard-wired to `LOGIN_PATH`; adapt or use `npm run codegen` for other pages).

## Default Verification Order

1. `npm run typecheck`
2. the narrowest spec/test touching the change
3. full `npm test`

## Commands

| Purpose | Command |
|---|---|
| Install | `npm install; npx playwright install chromium` |
| Typecheck | `npm run typecheck` |
| All tests (headless, 1 worker) | `npm test` |
| One file | `npx playwright test tests/login.spec.ts` |
| One test by title | `npx playwright test -g "wrong password"` |
| Skip auth setup project | `npx playwright test tests/smoke.spec.ts --no-deps` |
| Headed / UI / debug | `npm run test:headed` / `npm run test:ui` / `npm run test:debug` |
| Record selectors | `npm run codegen` |
| Open last HTML report | `npm run report` |
| Dump page DOM + screenshot | `npm run inspect` (→ `artifacts/`) |
| Target another branch (PowerShell) | `$env:BASE_URL='https://<app>.bubbleapps.io/version-<branch>'; npm test` |

## Projects and Config

- `setup` → `tests/auth.setup.ts` logs in via `LoginPage`, writes `playwright/.auth/user.json`.
- `chromium` → depends on `setup`, loads that storage state. Signed-out specs: `test.use({ storageState: { cookies: [], origins: [] } })`.
- Timeouts: test 60s, navigation 45s, action 15s, expect 10s. `retries: 0`, `workers: 1`, not fully parallel.
- Artifacts: trace on first retry (effectively off with 0 retries), screenshot on failure, video retained on failure → `test-results/`; HTML report → `playwright-report/`.

## Debugging Quick Reference

| Symptom | Likely cause / fix |
|---|---|
| Config throws `BASE_URL is missing` | `.env` absent — copy `.env.example` |
| 401 / blank body / empty title | Site password protection — set `APP_PASSWORD` |
| Locator not found | ID missing in the **tested branch**; run `npm run inspect`, add ID in editor or a fallback in the page object |
| Element found but wrong text/empty/disabled | Hydration — wait on the populated state (`toHaveText`, `toBeEnabled`, `toHaveValue`), not `toBeVisible` alone |
| Navigation timeout | Bubble cold start; rerun once |
| Redirected to login / signed-in specs fail | Stale session or branch switch — delete `playwright/.auth/` |
| URL lost `/version-xxx` | A `goto('/...')` with a leading slash — make it relative |
| Strict-mode violation (multiple matches) | Repeating-group cells share an ID — scope with `.filter({ hasText })` |

## Known Gaps

- Coverage is only login, smoke, and the Data API template. Forms, repeating groups, and popups have no specs or page objects yet (see `process/features/`).
- `records.spec.ts` skips unless `BUBBLE_API_TOKEN` + `BUBBLE_TEST_TYPE` (+ `BUBBLE_TEST_FIELDS`) are set; seeding is wired per feature branch as needed.
- `scripts/inspect-page.ts` only inspects the login page.
- No CI workflow yet (repo is on GitHub).
- `retries: 0` means `trace: 'on-first-retry'` never records — use `--trace on` when debugging.

## Source Paths

- `process/context/tests/all-tests.md` (this file)
- `process/context/tests/bubble-patterns.md`

## Update Triggers

- new spec files, projects, or npm scripts
- timeout/retry/worker changes in `playwright.config.ts`
- new support helpers or page objects that establish a pattern
- CI gets added
