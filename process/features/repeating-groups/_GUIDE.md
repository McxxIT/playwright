# Repeating Groups

<!-- Part of bubble-playwright-e2e -->

## Scope

E2E coverage of Bubble repeating groups and dynamic lists: rows loading after hydration, filtering/search/sort, row-level actions (edit/delete/open), pagination or lazy-loaded scrolling, and lists reflecting data created by forms or seeded via the Data API.

## Key Source Files

- `pages/` — new list page objects exposing a `row(text)` helper scoped with `.filter({ hasText })`
- `tests/` — new list specs
- `support/bubble-api.ts` — seed known rows (`create`) and clean up (`remove`)
- `tests/records.spec.ts` — Data API seeding template

## Related Context

- `process/context/tests/all-tests.md` — commands, projects, debugging
- `process/context/tests/bubble-patterns.md` — §1 selectors, §2 hydration, §4 repeating groups

## Current Status

Status: not-started (no specs or page objects yet; area prioritized during vc-setup on 18-11-26)

## Folder Contents

```
process/features/repeating-groups/
  active/       -- in-progress plans for this feature (each task lives inside a {slug}_{date}/ task folder)
  completed/    -- archived completed plans
  backlog/      -- deferred/future plans
```

All artifacts (plans, specs, reports, references) colocate inside each `{slug}_{date}/` task folder. Do NOT create `reports/` or `references/` sibling dirs.
