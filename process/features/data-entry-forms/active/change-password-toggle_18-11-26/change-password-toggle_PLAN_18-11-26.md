---
name: plan:change-password-toggle
description: "E2E coverage for show/hide password toggles on the Bubble change-password page (branch version-13p0j)"
date: 18-11-26
feature: data-entry-forms
---

# Change Password — Show/Hide Toggle E2E Coverage (SIMPLE)

TL;DR: Add one page object and one read-only spec that checks each of the 3 password rows starts masked, unmasks with the typed value, re-masks, toggles independently, and shows the right eye icon. The form is never submitted. A live probe on `version-13p0j` confirmed login works, the masked-to-plain value sync, and the icon change; only the plain-to-masked sync (S5) is still unprobed.

Status: VALIDATED (Gate: PASS, 18-11-26, after 1 PVL supplement cycle); awaiting ENTER EXECUTE MODE
Complexity: SIMPLE
Date: 18-11-26
Context: process/context/all-context.md; testing context process/context/tests/all-tests.md and tests/bubble-patterns.md (post-phase testing = the spec run in the Verification Evidence table)

## Overview

Bubble branch `version-13p0j` adds show/hide eye toggles to the 3 password fields on `institution_page/change-password`. Each row has a masked input and a separate plain input; the toggle swaps which is visible. This plan adds read-only E2E coverage.

## Live Probe Findings (version-13p0j, verified 18-11-26)

- Login works: `npx playwright test --project=setup` passes; `.env` `BASE_URL` is now `/version-13p0j`. The earlier failure came from a stale `/version-43jga` BASE_URL. The login page has no Bubble IDs; `LoginPage` works through its fallback locators.
- Change-password page loads with no redirect. At load: 3 groups, 3 masked inputs (`<input type=password>`) and 3 toggles, all visible.
- The 3 `*-plain` inputs are NOT IN THE DOM at load (count 0), not `display:none`.
- First click: plain input is created as `<input type=text>`, visible, with the exact same value as the masked input. Masked input becomes `display:none`, stays in the DOM, keeps its value. Toggle SVG `<use href>` goes from `...#eye-off` to `...#eye`.
- Second click: plain input stays in the DOM but is `display:none`. Masked input visible again, keeps its value. Icon returns to `#eye-off`.
- Toggles are 30x30 `<button>` elements with no aria-label, title or text; they contain an ionicons SVG.
- Masked-to-plain value sync confirmed. Plain-to-masked sync (S5) NOT probed.

## Acceptance Criteria

Each criterion names its proving scenario (REQ-TEST-LINK).

- AC1: All 3 rows start masked (masked visible, plain hidden or absent) with a visible toggle showing the `#eye-off` icon. proven by: S1 | strategy: Hybrid
- AC2: Toggling shows the plain input holding the typed value and switches the icon to `#eye`. proven by: S2 | strategy: Hybrid
- AC3: Toggling again re-masks, keeps the value, and restores the `#eye-off` icon. proven by: S3 | strategy: Hybrid
- AC4: Each toggle affects only its own row. proven by: S4 | strategy: Hybrid
- AC5: Edits made in the plain input survive re-masking (reverse sync). proven by: S5 | strategy: Hybrid (soft assertions; unprobed)
- AC6: The spec never submits the form; `npm run typecheck` passes. proven by: typecheck gate + page object exposes no submit locator | strategy: Fully-Automated

## Phase Completion Rules

- CODE DONE: both files written and typecheck passes.
- VERIFIED: spec run against version-13p0j with S1–S5 results recorded (a failing sync assertion counts as verified-with-defect, reported to the user).

## Requirements (SPEC — locked inline, trivial scope)

- Goal: each of Current / New / Verify New Password has a clickable eye icon that swaps between masked and plain-text display so the user can check what they typed.
- In scope: initial masked state, unmask shows the typed value, re-mask, row independence, all 3 toggles visible and clickable, icon state (`#eye` / `#eye-off`).
- Out of scope: submitting the form, password validation rules, error messages, pixel-level icon comparison.
- Constraints: never click submit (would change the shared user's password); relative navigation only; reuse `setup` storage state; no `debug_mode=true` (editor debugger flag that adds a debugger bar and slows rendering; not what users see).

## Approach (Decision Summary)

### Chosen Approach
Page object `ChangePasswordPage` with per-row helper `row('current'|'new'|'verify')` returning `{ toggle, icon, masked, plain, group }` locators (`icon` = `toggle.locator('use')`), plus a spec asserting visibility state (`toBeVisible`/`toBeHidden`), values (`toHaveValue`) and icon href (`toHaveAttribute('href', /#eye(-off)?$/)`).

### Why This Over Alternatives
| Alternative | Why Rejected |
|---|---|
| Assert on `type` attribute flip of a single input | Bubble uses two separate inputs, so `type` never flips (confirmed live) |
| Inline locators in the spec, no page object | Breaks the repo's page-object convention; 3 rows x 4 IDs is repetitive |
| Visual snapshot of the icon | Brittle across deploys; the SVG `<use href>` is a stable, automatable signal |
| `toHaveCount(0)` to assert plain is hidden | Plain input is absent at load but present-and-hidden after a second toggle; count assertions fail one of the two states. `toBeHidden()` passes for both |

### Risk Predictions
- Value sync: masked-to-plain confirmed live. Plain-to-masked (S5) unprobed; if it fails it is a product defect to report, not something to work around.
- Hydration: toggle is a workflow + custom state; assert with web-first `expect` (auto-retry), never sleeps.
- Plain input lifecycle: absent at load, created on first click, hidden thereafter. All plain-hidden assertions use `toBeHidden()`; never `toHaveCount(0)` after a toggle.
- Icon locator: `use` href may be exposed as `href` (verified); if a future deploy uses `xlink:href`, the icon assertion fails loudly and the page object is the single place to fix.
- Shared account: a submit click would change the password and break every other spec.

### Key Constraints Accepted
- Spec must run against `version-13p0j` only (BASE_URL override); it is not portable to branches without the IDs.
- No submit button locator is defined in the page object at all, to make accidental submission impossible.

## Touchpoints

- Create `pages/change-password.page.ts`
- Create `tests/change-password-toggle.spec.ts`
- Read: `pages/login.page.ts`, `support/bubble-helpers.ts`, `playwright.config.ts`

## Public Contracts

- New exported class `ChangePasswordPage` (`goto()`, `row(name)` returning `{ group, masked, plain, toggle, icon }`, `toggle(name, to)`). No changes to existing exports, config, or env vars.

## Blast Radius

- 2 new files, 0 modified. Risk class: low (test-only). Indirect risk: shared test account password if the form were submitted — mitigated by not defining a submit locator.

## Implementation Checklist

1. `pages/change-password.page.ts`:
   - `goto()`: `page.goto('institution_page/change-password')` (relative, no `debug_mode`), then `waitForBubbleReady`, then `expect(row('current').group).toBeVisible()` with a message naming the version-13p0j branch requirement.
   - `row(name)`: `getByTestId('toggle-<name>-password')`, `input-<name>-password`, `input-<name>-password-plain`, `group-<name>-password`. Masked fallback `.or(group.locator('input[type="password"]'))`, `.first()`. Plain locator must tolerate being absent (never resolve with `.first()` assumptions that throw at read time; locators are lazy so this holds).
   - `icon`: `toggle.locator('use')` (the `<use>` inside the toggle's SVG).
   - `toggle(name, to: 'plain' | 'masked')`: click the toggle button only, then wait for the swap in the stated direction with a web-first expect (`to: 'plain'` waits for plain `toBeVisible`; `to: 'masked'` waits for masked `toBeVisible`). The caller always states the direction, so the helper can never wait for the wrong state and hang.
   - No submit-button getter.
2. `tests/change-password-toggle.spec.ts` (import from `@playwright/test`; uses stored session):
   - S1 initial state: for each row, masked visible with `type=password`, `plain` `toBeHidden()` (passes when the element is absent), toggle visible, icon `toHaveAttribute('href', /#eye-off$/)`.
   - S2 unmask carries value: fill masked with `uniqueName('Pw')`, toggle, plain visible with `type=text` and the same value (`expect.soft` for the value), masked hidden, icon `toHaveAttribute('href', /#eye$/)`.
   - S3 re-mask: toggle again, masked visible and still holds the value, plain `toBeHidden()` (it now exists but is `display:none`; do NOT use `toHaveCount(0)`), icon `toHaveAttribute('href', /#eye-off$/)`.
   - S4 independence: toggling row X leaves the other two rows masked (masked visible, plain `toBeHidden()`, icon `#eye-off`); run as 3 separate `test()` cases (one per toggled row, generated by a `for` loop over the row names), each starting from a fresh `goto()`, so one row's toggled state never leaks into the next row's "others masked" check.
   - S5 edit in plain then re-mask: toggle to plain, type a new value in the plain input, toggle back, masked shows the edited value via `expect.soft` with a clear message (reverse sync, unprobed). A failure is reported as a product defect.
   - Guard: no URL-based `test.skip`; `goto()` fails loudly if the group is missing, with a message naming the branch requirement.
   - S2/S3/S5 value assertions use `expect.soft` plus a clear message so a sync defect is reported per row without hiding the other rows.
3. `npm run typecheck`.
4. Run `npx playwright test tests/change-password-toggle.spec.ts` against `version-13p0j` (login works; `.env` `BASE_URL` already points there). Record S1–S5 results. If S5 sync fails, keep the test failing and report it as a product defect.

## Verification Evidence

| Gate / Scenario | Strategy | Proves SPEC criterion |
|---|---|---|
| `npm run typecheck` | Fully-Automated | AC6: code compiles under strict TS; no submit locator exposed |
| S1 initial masked (3 rows, icon `#eye-off`) | Hybrid (precondition: live app on version-13p0j, valid creds, `setup` project passes) | AC1 |
| S2 unmask shows typed value, icon `#eye` | Hybrid | AC2 |
| S3 re-mask keeps value, icon `#eye-off` | Hybrid | AC3 |
| S4 row independence | Hybrid | AC4 |
| S5 plain to masked sync (`expect.soft`, unprobed) | Hybrid | AC5 |

Known-Gap: none. The earlier Agent-Probe for the icon is replaced by the automated icon assertions in S1–S4.

## Test Infra Improvement Notes

- Login now works on `version-13p0j`; the earlier failure was a stale `/version-43jga` BASE_URL in `.env`. Reminder: delete `playwright/.auth/` when switching branches.
- The login page has no Bubble IDs; `LoginPage` relies on fallback locators. Optional follow-up outside this plan: add `login-email`, `login-password`, `login-submit` ID attributes in the Bubble editor.
- Kit has no per-spec branch tag; consider a `@branch:13p0j` tag later.
- Toggle buttons have no aria-label/title/text; consider adding stable IDs/labels in the editor (already have `toggle-<name>-password` IDs per plan).

## Resume and Execution Handoff

1. Selected plan: `process/features/data-entry-forms/active/change-password-toggle_18-11-26/change-password-toggle_PLAN_18-11-26.md`
2. Last completed step: PLAN supplement (PVL-supplement, live probe findings folded in)
3. Validate-contract status: written 18-11-26, Gate: PASS (generated-by outer-pvl, after 1 PVL supplement cycle)
4. Context loaded: `all-context.md`, `tests/bubble-patterns.md`, `data-entry-forms/_GUIDE.md`, `pages/login.page.ts`, `support/bubble-helpers.ts`, `playwright.config.ts`
5. Next step: ENTER EXECUTE MODE (spawn vc-execute-agent with this plan path). Preconditions already met: `.env` `BASE_URL` is `/version-13p0j` and login passes. Delete `playwright/.auth/` only if the session is stale.

## Validate Contract

Status: PASS
Date: 18-11-26
date: 2026-11-18
generated-by: outer-pvl
supersedes: 2026-11-18 (outer-pvl) — prior contract was CONDITIONAL (2 concerns); both resolved by the live probe in PVL cycle 1, so this contract has current evidence

Parallel strategy: sequential
Rationale: strategy score 0/7 (no multi-package scope, no schema/API/auth surface, 2 new files, test-only, no high-risk class). Dominant signal: none. A single sonnet validation pass covered the 4 dimensions plus the 2 file sections; execute is one opus execute-agent, no fan-out.

Test gates (C3 5-column table; the legacy line form follows it):

| criterion id | behavior | strategy | proving test | gap-resolution |
|---|---|---|---|---|
| AC1 | All 3 rows start masked (masked visible, plain hidden or absent), toggle visible, icon `#eye-off` | Hybrid | `npx playwright test tests/change-password-toggle.spec.ts` — test titled `S1 ...` (precondition: live app on version-13p0j, `setup` project passes) | B |
| AC2 | Toggle shows plain input (`type=text`) holding the typed value, masked hidden, icon `#eye` | Hybrid | same command — test titled `S2 ...` | B |
| AC3 | Toggle again re-masks, keeps the value, plain hidden, icon `#eye-off` | Hybrid | same command — test titled `S3 ...` | B |
| AC4 | Each toggle affects only its own row (3 cases, one per toggled row, each from a fresh `goto()`) | Hybrid | same command — tests titled `S4 ...` (one per row) | B |
| AC5 | Edits made in the plain input survive re-masking (reverse sync; unprobed, `expect.soft`) | Hybrid | same command — test titled `S5 ...` | B |
| AC6 | Both files compile under strict TS; the page object exposes no submit locator and the spec clicks only the 3 toggles | Fully-Automated | `npm run typecheck` (exits 0) plus the E1 review that no submit getter exists | B |

Failing stub (AC6, Fully-Automated row): not applicable. The gate is a compiler command, not a test body, so a `throw` stub would prove nothing. The red-first signal comes from the Hybrid S1-S5 rows: execute-agent writes the spec first and runs it before the page-object helpers are complete. Hybrid rows receive no stubs.

gap-resolution legend: A proven now | B fixed in this plan (gate added by this plan's checklist) | C deferred to a named later plan | D backlog test-building stub.
C-4 reconciliation: `strategy` carries only Fully-Automated / Hybrid / Agent-Probe. Known-Gap is never a strategy; none is used here (the plan's earlier Agent-Probe for the icon was replaced by automated `href` assertions).

Legacy line form:
- Page object + spec (S1-S5): [hybrid: `npx playwright test tests/change-password-toggle.spec.ts` — precondition: BASE_URL on version-13p0j, valid TEST_USER creds, `setup` project passes]
- Compile / no-submit: [fully-automated: `npm run typecheck`]

Dimension findings:
- Infra fit: PASS — 2 new files fit the existing `pages/` + `tests/` layout; `tsconfig.json` includes both globs; chromium project has no testMatch conflict and depends on `setup`; `waitForBubbleReady` and `uniqueName` exist in `support/bubble-helpers.ts`.
- Test coverage: PASS — every developed behavior (AC1-AC5) has a Hybrid gate and AC6 has a Fully-Automated gate, so this is not vacuously green. S5 is an unprobed but gated residual (soft assertion), accepted by the user.
- Breaking changes: PASS — 0 modified files, no existing export, config or env var touched.
- Security surface: PASS — no secrets read or written; the form is never submitted and no submit locator is defined, which removes the shared-account password-change risk; the only typed data is a synthetic `uniqueName('Pw')` string; no auth code or schema touched.
- Section 1 feasibility (`pages/change-password.page.ts`): PASS — mechanically feasible. IDs (`toggle|input|group-<name>-password`, `-plain`) come from the plan and probe, with no independent on-disk evidence of the exact strings; `goto()` fails loudly on a missing group, so a wrong ID cannot pass silently. Highest-risk edit: the `toggle()` wait direction (resolved by P1, below).
- Section 2 feasibility (`tests/change-password-toggle.spec.ts`): PASS — highest-risk edit was the S4 loop leaking toggled state between rows (resolved by P2, below). `toBeHidden()` correctly handles the absent-then-hidden plain input; `toHaveAttribute('href', /#eye$/)` does not match `#eye-off` because of the `$` anchor.

Plan updates applied during V6 (fixed in plan, so they are not open concerns):
- P1 (Implementation Checklist 1, Public Contracts): `toggle(name)` becomes `toggle(name, to: 'plain' | 'masked')`; the caller always states the direction, so the helper can never wait for the wrong state and hang.
- P2 (Implementation Checklist 2, S4): S4 runs as 3 separate `test()` cases generated by a `for` loop over the row names, each starting from a fresh `goto()`, so one row's toggled state does not break the next row's "others masked" check.

Execute-agent instructions:
- E1: Never add a submit locator or click any button other than the 3 toggles.
- E2: If value sync fails, do not add code to copy values; leave the assertion failing and report it as a product defect.
- E3: Login is verified working. If `setup` unexpectedly fails, report BLOCKED with the failure output; do not stop at typecheck and claim DONE.
- E4: Assert plain-hidden with `toBeHidden()`, never `toHaveCount(0)` after a toggle; assert the icon via `toggle.locator('use')` `toHaveAttribute('href', /#eye(-off)?$/)`.
- E5: Title tests with the prefixes `S1`..`S5` (S4 per row, e.g. `S4 toggling current leaves others masked`) so each gate row maps to a test by name. Use `toggle(name, to)` per P1 and one test per row per P2.
- E6: If `goto()` fails on a missing `group-<name>-password` (ID differs on the branch), report BLOCKED with the failure output and the `npm run codegen` / `npm run inspect` finding; do not invent fallbacks for the plain, toggle or group locators.

Open gaps:
- S5 reverse sync (plain input back to masked) unprobed: accepted residual, `expect.soft`; a failure is a product defect, not a plan defect. It also makes the gate command exit non-zero if the product defect exists. That is intended, and it is reported rather than worked around.
- Exact Bubble ID strings for the `verify` row have no on-disk probe artifact; covered by the loud `goto()` guard and E6.

What this coverage does NOT prove:
- `npm run typecheck`: not that any selector resolves, that the page renders, or that any behavior works at runtime.
- S1-S5 spec run: not that the form submits or validates correctly (out of scope, never submitted); not behavior on any branch other than version-13p0j; not pixel-level icon appearance (only the `<use href>` token); not keyboard or screen-reader operability (toggles have no aria-label); not behavior after a page reload mid-edit; not mobile viewport layout (Desktop Chrome only).
- S5 specifically: the plain-to-masked sync is unprobed, so a pass is the first evidence of it and a fail is the first evidence of a defect.

Gate: PASS
Accepted by: n/a — Gate is PASS with no outstanding concerns. The S5 reverse-sync risk was accepted by the user in the validate invocation (known residual, not a blocker).

## Autonomous Goal Block

SESSION GOAL: Add read-only E2E coverage for the show/hide password toggles on the Bubble change-password page (branch version-13p0j)
Charter + umbrella plan: N/A — single plan
Autonomy: standing autonomous execution per feedback_autonomous_phase_execution.md; removes approval pauses only. Subagent delegation stays mandatory (vc-execute-agent writes, vc-tester confirms gates).
Hard stop conditions / safety constraints:
- Never submit the change-password form and never click anything except the 3 toggles; do not add a submit locator (it would change the shared user's password).
- If value sync fails, do not code around it; leave the assertion failing and report a product defect.
- If the `setup` (login) project fails, report BLOCKED with the output; never stop at typecheck and claim DONE.
- Only 2 new files: pages/change-password.page.ts and tests/change-password-toggle.spec.ts; do not edit config, env or existing specs.
- Do not launch Playwright against any branch other than version-13p0j (.env BASE_URL).
Next phase: EXECUTE: process/features/data-entry-forms/active/change-password-toggle_18-11-26/change-password-toggle_PLAN_18-11-26.md
Validate contract: inline in plan (## Validate Contract, Gate: PASS)
Execute start: npm run typecheck | npx playwright test tests/change-password-toggle.spec.ts (setup runs as a dependency) | probe: none | high-risk pack: no
