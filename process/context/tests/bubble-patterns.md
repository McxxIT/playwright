---
name: context:bubble-patterns
description: "Bubble-specific selector, hydration, form, repeating-group, and popup patterns for Playwright specs"
keywords: bubble, selector, id attribute, getbytestid, hydration, waitforbubbleready, networkidle, repeating group, list, popup, modal, form, input, validation, flaky
related: [context:all-tests]
date: 18-11-26
---

# Bubble Patterns for Playwright

Deep doc in the `tests/` group. Read after `all-tests.md` when writing or debugging specs that touch Bubble UI.

## 1. Selectors: explicit IDs only

- `testIdAttribute` is `id`. Use `page.getByTestId('<bubble-id>')`.
- Every element a test interacts with or asserts on should have a Bubble **ID attribute** set in the editor, in the **branch under test** (IDs added only in live won't exist in `version-test` or a defect branch, and vice versa).
- Never select auto-generated Bubble classes (`.baTaHaB`, `.bubble-r-container` children by class, etc.) — they change on deploy.
- Fallbacks (layered `.or(...)` in page objects) are a safety net while IDs are being added, not the target state. Order: ID → `type`/`name` → placeholder → label → role → `.first()`.
- ID naming: kebab-case, area-prefixed — `form-<name>-<field>`, `form-<name>-submit`, `rg-<name>` / `rg-<name>-row`, `popup-<name>`, `popup-<name>-close`.
- Can't find it? `npm run inspect` (login page) or `npm run codegen` to see what actually renders.

## 2. Hydration: wait for the state you need

Bubble paints the page, then evaluates workflows, conditionals, and data sources. An element can be attached/visible before it's correct.

- Never `waitForLoadState('networkidle')` — the websocket keeps the network busy.
- Never `page.waitForTimeout(...)` in specs.
- After navigation: `await waitForBubbleReady(page)` (body visible → `#bubble-standard-loader` hidden → first `.bubble-element` attached; misses are tolerated).
- Then assert the **meaningful** state with web-first assertions, which retry until the 10s expect timeout:
  - data loaded: `await expect(el).toHaveText(/.+/)` or `toHaveText('expected')`, `toHaveCount(n)`
  - input prefilled: `toHaveValue(...)`
  - button active after conditional: `toBeEnabled()`
  - conditional visibility: `toBeVisible()` / `toBeHidden()`
- For slow first loads on a cold branch, raise the single assertion's `timeout` rather than adding sleeps.

## 3. Data entry forms

- Fill by ID, then submit by ID. Bubble inputs may only commit on blur/change — if a value doesn't stick, `press('Tab')` after `fill`.
- Dropdowns are often custom Bubble elements, not native `<select>`: click the dropdown, then choose the option by role/text scoped to it. Use `selectOption` only for native selects.
- Assert the outcome, not the click: a success message, a navigation, a repeating-group row with the unique value, or a Data API `list` with a constraint on the unique value.
- Use `uniqueName()` / `uniqueEmail()` so reruns don't collide; delete created records via `bubbleApi.remove` in `finally` when the Data API is available.
- Validation cases: assert the error element/state appears **and** that no record was created.

## 4. Repeating groups (lists)

- All cells share the same element ID. Scope by content:
  `page.locator('[id^="rg-tasks-row"]').filter({ hasText: name })`.
- Act inside the row: `row.getByTestId('rg-tasks-row-delete')` (or a role inside the row).
- Wait for the list to load before counting: `await expect(rows.first()).toBeVisible()` then `toHaveCount`, or assert the specific seeded row appears.
- Bubble repeating groups may lazy-load/paginate ("ext. vertical scrolling"); scroll the group or filter/search to bring a row into the DOM rather than assuming all rows render.
- Prefer seeding known rows via the Data API, then filtering for them, over asserting on whatever data exists in the branch.

## 5. Popups / modals

- Give the popup element an ID (`popup-<name>`). Opening: click the trigger, then `await expect(page.getByTestId('popup-<name>')).toBeVisible()`.
- Scope every in-popup locator to the popup locator — Bubble pages often contain duplicate-looking elements in hidden popups.
- Hidden popups remain in the DOM; assert closure with `toBeHidden()`, not `toHaveCount(0)`.
- Test closing paths explicitly: close button, and backdrop/Escape only if the popup is configured to allow it ("Close popup when pressing esc" is a Bubble setting).
- Popup content can hydrate after the popup becomes visible (data source set on open) — assert the populated field, not just visibility.

## 6. Navigation and session

- Relative paths only: `page.goto('./')`, `page.goto('page_name')`. A leading `/` drops the `/version-xxx` branch segment.
- Specs start signed in (storage state). Use `test.use({ storageState: { cookies: [], origins: [] } })` for signed-out scenarios.
- Specs run serially against one shared session and one live database — keep tests independent by using unique data, not by assuming an empty table.
