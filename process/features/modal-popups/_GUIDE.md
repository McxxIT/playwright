# Modal Popups

<!-- Part of bubble-playwright-e2e -->

## Scope

E2E coverage of Bubble popups/modals: open triggers, content hydrating on open, forms inside popups, close paths (close button, Escape, backdrop when enabled), and correct hidden state after close. Popups stay in the DOM when hidden, so assertions are visibility-based and scoped to the popup.

## Key Source Files

- `pages/` — popup page objects/components rooted at `getByTestId('popup-<name>')`
- `tests/` — new popup specs
- `support/bubble-helpers.ts` — `waitForBubbleReady`

## Related Context

- `process/context/tests/all-tests.md` — commands, projects, debugging
- `process/context/tests/bubble-patterns.md` — §1 selectors, §2 hydration, §5 popups

## Current Status

Status: not-started (no specs or page objects yet; area prioritized during vc-setup on 18-11-26)

## Folder Contents

```
process/features/modal-popups/
  active/       -- in-progress plans for this feature (each task lives inside a {slug}_{date}/ task folder)
  completed/    -- archived completed plans
  backlog/      -- deferred/future plans
```

All artifacts (plans, specs, reports, references) colocate inside each `{slug}_{date}/` task folder. Do NOT create `reports/` or `references/` sibling dirs.
