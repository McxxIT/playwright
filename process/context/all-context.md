# bubble-playwright-e2e - All Context

Last updated: 18-11-26 (vc-setup STUDY)

This file is the root context entrypoint for the repo.

Use it for two things:

1. quick routing to the right context pack or root file
2. broad architecture and repository understanding

Start here before loading deeper context files.

---

## How This File Works (the `all-*.md` Convention)

Every `process/context/` directory has one `all-*.md` entrypoint that acts as an attachable quick router for that domain. This root file (`all-context.md`) is the top-level router. Context groups each have their own `all-{group}.md` entrypoint.

**How agents use it:**

1. Agent reads `all-context.md` first (this file)
2. Finds the relevant context group from the routing tables below
3. Reads that group's `all-{group}.md` entrypoint
4. Only then loads the specific deep doc needed

This layered routing keeps context windows small. Never load the whole `process/context/` tree.

---

## Quick Start

For most substantial tasks:

1. read this file first
2. choose the smallest relevant root file or context group from the tables below
3. only then load deeper files

---

## Project Summary

**What it is:** A black-box Playwright + TypeScript end-to-end suite for **Bubble.io** web apps. There is **no application source in this repo**. Tests drive the real UI of a deployed Bubble branch, with an optional Bubble Data API client for deterministic test data.

**Why it exists:** Verifying bug fixes, defect branches, and core user workflows (auth, forms, dynamic data loading) during Bubble development and QA cycles.

**Who uses it:** The developer/QA engineer running it locally from the terminal during "vibe coding" and QA cycles. Execution is local today; keep it clean enough to drop into GitHub Actions later (`forbidOnly` already keys off `CI`).

**Target environments:** Multiple Bubble branches, selected dynamically by overriding `BASE_URL` — `/version-test` and custom defect-branch URLs (`/version-<branch>`). Never assume a single fixed branch.

**Next coverage priorities (feature folders exist for each):**

| Area | Feature folder |
|---|---|
| Core data entry forms (inputs, validation, submit, persisted result) | `process/features/data-entry-forms/` |
| Repeating groups / dynamic lists (load, filter, row actions) | `process/features/repeating-groups/` |
| Modal popups (open/close, in-popup forms, backdrop behaviour) | `process/features/modal-popups/` |

**Main risks to keep in mind:**

- **Asynchronous hydration:** Bubble evaluates workflows and conditionals after initial load. An element can be attached but not yet populated, enabled, or correctly visible. Always wait on a specific, meaningful state — never on time or `networkidle`.
- **Selector stability:** Critical components must use explicit Bubble "ID attribute" values (`id="your-id"`). Never target Bubble's auto-generated classes (e.g. `baTaHaB`) — they change between deploys.

---

## Current Root Entry Points

<!-- The two tables below (Root Entry Points + Context Groups) are GENERATED from each
     context doc's frontmatter by `discover-context.mjs --emit-routing`. Do NOT hand-edit
     between the GENERATED markers — your edits will be overwritten on the next rebuild.
     To change a row, edit the owning doc's frontmatter (description / keywords) and re-emit.
     `--check-routing` fails lint if this block drifts from the frontmatter on disk.
     NOTE: this repo is not a git repo yet; discover-context.mjs needs `git rev-parse`, so this
     block was written by hand to match the script's output format. Re-emit after `git init`. -->

<!-- GENERATED:routing -->
| File | Read when |
|---|---|
| `process/context/all-context.md` | any substantial planning, research, review, or implementation task |
| `process/context/planning/all-planning.md` | Plan-shape calibration and planning conventions — the planning group entrypoint/router |
| `process/context/tests/all-tests.md` | Running, writing, or debugging Playwright specs against Bubble — the tests group entrypoint/router |

## Current Context Groups

| Group | Entry point | Scope |
|---|---|---|
| `planning/` | `process/context/planning/all-planning.md` | Plan-shape calibration and planning conventions — the planning group entrypoint/router |
| `tests/` | `process/context/tests/all-tests.md` | Running, writing, or debugging Playwright specs against Bubble — the tests group entrypoint/router |
<!-- /GENERATED:routing -->

## Task Routing Table

| Task type | Load first | Then load |
|---|---|---|
| general repo research | `all-context.md` | the source file named by the task |
| writing a new spec or page object | `all-context.md`, `tests/all-tests.md` | `tests/bubble-patterns.md`, then the feature `_GUIDE.md` |
| forms / repeating groups / popups work | `all-context.md`, `tests/all-tests.md` | `tests/bubble-patterns.md` + `process/features/{area}/_GUIDE.md` |
| debugging a failing or flaky test | `all-context.md`, `tests/all-tests.md` | `tests/bubble-patterns.md` (hydration + selector sections) |
| Data API seeding / cleanup | `all-context.md`, `tests/all-tests.md` | `support/bubble-api.ts`, `tests/records.spec.ts` |
| implementation planning | `all-context.md`, `planning/all-planning.md` | the relevant example PRD plus active plan |
| CI setup (future GitHub Actions) | `all-context.md`, `tests/all-tests.md` | `playwright.config.ts` |
| context maintenance | `all-context.md` | run `vc-audit-context` after edits |

## Context Group Lifecycle

Context groups are durable knowledge domains, not feature folders.

Create a group when:

- a topic has 3+ durable docs
- a single doc exceeds roughly 800 lines with separable subtopics
- multiple agents repeatedly need only one slice of a large context file
- the topic maps to a stable operational domain (tests, infra, CI, etc.)

Do not create a group when:

- the content is a temporary report
- the content is a plan or execution artifact
- the topic is feature-specific and belongs in `process/features/...`

Move or split one group at a time. Use `all-{group}.md` entrypoints. Run the `vc-audit-context` skill after every context organization change.

## Naming Convention

There are no `README.md` files inside `process/context/`.

Canonical entrypoints use `all-*.md`:

- root: `process/context/all-context.md`
- group: `process/context/{group}/all-{group}.md`

## Context Update Protocol

When durable project knowledge changes:

1. update the smallest relevant context file
2. update this file if routing, ownership, naming, or groups changed
3. update the owning `all-{group}.md` entrypoint when a group exists
4. run `vc-audit-context`

---

## Repository Structure

```
playwright/                      (repo root; npm package "bubble-playwright-e2e")
  playwright.config.ts           baseURL (branch-preserving), setup+chromium projects, timeouts, testIdAttribute='id'
  tsconfig.json                  strict, ES2022, nodenext; noEmit (typecheck only)
  .env / .env.example            runtime config (.env is git-ignored)
  pages/
    login.page.ts                LoginPage page object — layered locator pattern to copy
  support/
    env.ts                       lazy typed env getters (required vars throw on access)
    bubble-helpers.ts            waitForBubbleReady, uniqueSuffix/uniqueEmail/uniqueName
    bubble-api.ts                BubbleApi Data API client (list/get/create/update/remove)
    fixtures.ts                  extended `test` with `bubbleApi` fixture
  tests/
    auth.setup.ts                logs in once, writes playwright/.auth/user.json
    login.spec.ts                signed-out login page tests
    smoke.spec.ts                stored session reaches app; branch segment preserved
    records.spec.ts              Data API template (self-skips without token/type)
  scripts/
    inspect-page.ts              DOM dump (inputs/buttons/ids/links) + screenshot → artifacts/
  playwright/.auth/              stored session (git-ignored)
  artifacts/, test-results/, playwright-report/   generated output (git-ignored)
  process/
    context/                     this context system
    general-plans/               cross-cutting plans (active/completed/backlog)
    features/                    data-entry-forms/, repeating-groups/, modal-popups/
    development-protocols/       RIPER-5 methodology docs (managed)
  .claude/ .codex/ .agents/      agent harness (managed)
```

## Technology Stack

- **Test framework:** `@playwright/test` 1.65.1 (Chromium only, `Desktop Chrome` device)
- **Language:** TypeScript ^7.0.2, `strict`, target ES2022, `module`/`moduleResolution: nodenext`, CommonJS package (`"type": "commonjs"`)
- **Runtime:** Node 24.x (v24.2.0 observed)
- **Script runner:** `tsx` ^4.23 (for `scripts/inspect-page.ts`)
- **Config loading:** `dotenv` ^18 (`import 'dotenv/config'` in config and scripts)
- **Package manager:** npm (`package-lock.json`); single package, no monorepo
- **System under test:** a deployed Bubble.io app (no-code; no source here). Data via Bubble Data API v1.1 (`/api/1.1/obj/<type>`)
- **Lint:** none — `npm run typecheck` (`tsc --noEmit`) is the only static check
- **VCS / CI:** not a git repo yet; no CI configured (GitHub Actions planned later)

## Key Patterns and Conventions

**Navigation is relative, without a leading slash.** `BASE_URL` contains the branch segment (`/version-test`, `/version-<branch>`). The config appends a trailing slash; `page.goto('./')` / `page.goto('login_page')` keep the branch, while `page.goto('/x')` drops it.

**Test IDs are Bubble ID attributes.** `testIdAttribute: 'id'`, so `page.getByTestId('login-email')` matches `id="login-email"`. Every element a test touches should get an explicit ID in the Bubble editor, in the **tested branch**. Never select Bubble's auto-generated class names.

**Page objects use layered locators.** Bubble ID first, then `.or(...)` fallbacks (type/name/placeholder/label/role), ending in `.first()`. Getters return `Locator`; actions are `async` methods that also wait for the resulting state (see `LoginPage.login` → `waitForLoggedIn`). New page objects go in `pages/<name>.page.ts` with this pattern.

**Readiness, not network idle.** Bubble keeps a websocket open, so `networkidle` never settles. Use `waitForBubbleReady(page)` after navigation, then wait on the specific element/state the test depends on (hydration risk).

**Repeating-group cells share an ID.** Scope by content: `page.locator('[id^="task-row"]').filter({ hasText: 'QA 123' })`.

**Auth via storage state.** The `setup` project logs in once; `chromium` depends on it and reuses `playwright/.auth/user.json`. Signed-out specs override with `test.use({ storageState: { cookies: [], origins: [] } })`.

**Test data:** unique names/emails from `uniqueName()` / `uniqueEmail()`. Data API–created records are deleted in `finally`. Import `test`/`expect` from `support/fixtures.ts` when a spec needs `bubbleApi`; otherwise import from `@playwright/test`.

**Env access:** always through `support/env.ts` getters, never `process.env` directly in specs.

**Serial execution:** `workers: 1`, `fullyParallel: false` — one shared session against a live app; don't write specs that assume isolation from each other's data.

**Naming:** kebab-case files; `*.spec.ts` for specs, `*.page.ts` for page objects, `*.setup.ts` for setup projects; kebab-case Bubble IDs prefixed by area (`login-email`, `task-row`).

## Environment and Configuration

**Config files:** `playwright.config.ts`, `tsconfig.json`, `.env` (git-ignored; copy from `.env.example`). The config throws at load time if `BASE_URL` is missing.

**Env vars (names only, never values):**

- Target: `BASE_URL` (required; includes branch segment — override per run to target a defect branch), `LOGIN_PATH` (default `/login_page`)
- App user: `TEST_USER_EMAIL`, `TEST_USER_PASSWORD` (required by auth setup)
- Site password protection (HTTP Basic, not app login): `APP_USERNAME` (default `bubble`), `APP_PASSWORD`
- Data API (optional): `BUBBLE_API_TOKEN` (admin-level — keep local), `BUBBLE_TEST_TYPE`, `BUBBLE_TEST_FIELDS` (JSON)
- CI: `CI` (enables `forbidOnly`)

**Bubble editor prerequisites** (must exist in the tested branch, not only live): element ID attributes, Data API enabled with the data types exposed, password protection settings.

**Switching branch for one run (PowerShell):** `$env:BASE_URL='https://<app>.bubbleapps.io/version-<branch>'; npm test`. Delete `playwright/.auth/` when switching branches/users so the session is re-created.

## Source References

- `README.md` — env vars, Bubble editor checklist, troubleshooting table
- `playwright.config.ts` — timeouts, projects, baseURL handling
- `process/context/tests/all-tests.md` — test commands and debugging
- `process/context/tests/bubble-patterns.md` — Bubble selector, hydration, and component patterns
- `.vibecode-backup/CLAUDE.md` — pre-harness project CLAUDE.md (content merged here)

## Scan Metadata

- Generated: 18-11-26
- HEAD: n/a (not a git repository)
- Mode: vc-setup Flow A (new), fresh scaffold
- Package manager: npm
