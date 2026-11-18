# Data Entry Forms

<!-- Part of bubble-playwright-e2e -->

## Scope

E2E coverage of Bubble data entry forms: filling inputs (text, dropdowns, dates, checkboxes), client-side and workflow-driven validation, submit workflows, and verifying the persisted result in the UI or via the Data API. The goal is reliable verification of form bug fixes on defect branches.

## Key Source Files

- `pages/` — new `<form-name>.page.ts` page objects (follow `pages/login.page.ts` layered-locator pattern)
- `tests/` — new `<form-name>.spec.ts` specs
- `support/bubble-helpers.ts` — `uniqueName`/`uniqueEmail` for collision-free input data
- `support/bubble-api.ts` + `support/fixtures.ts` — verify/cleanup created records
- `pages/login.page.ts` — the only existing form page object (reference)

## Related Context

- `process/context/tests/all-tests.md` — commands, projects, debugging
- `process/context/tests/bubble-patterns.md` — §1 selectors, §2 hydration, §3 forms

## Current Status

Status: not-started (no specs or page objects yet; area prioritized during vc-setup on 18-11-26)

## Folder Contents

```
process/features/data-entry-forms/
  active/       -- in-progress plans for this feature (each task lives inside a {slug}_{date}/ task folder)
  completed/    -- archived completed plans
  backlog/      -- deferred/future plans
```

All artifacts (plans, specs, reports, references) colocate inside each `{slug}_{date}/` task folder. Do NOT create `reports/` or `references/` sibling dirs.
