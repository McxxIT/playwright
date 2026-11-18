---
type: evl-iteration-report
plan: change-password-toggle_PLAN_18-11-26.md
iteration: 1
date: 2026-11-18
---

# EVL Iteration 001

- **Confirmation run** (vc-tester): typecheck PASS; spec 7 passed / 1 failed.
- **Failing gate:** S5 "edits in the plain input survive re-masking". The masked input keeps the old value on all 3 rows.
- **Open question:** product defect vs test artifact.
  - S5 uses `plain.fill()` and then clicks the toggle immediately, with no blur or pause.
  - Bubble may commit input values only on change/blur, so the test may not match real user behaviour.
  - The tester's real-user probe was not run: it was blocked by the privacy hook/classifier.
- **Fix scope:** vc-execute-agent supplement, S5 only.
  - Make the edit user-realistic: pressSequentially, then blur (Tab), then a short wait for Bubble to commit before re-masking.
  - Keep `expect.soft` and keep the no-workaround rule. Do not copy values in the test.
- **Next:** vc-tester re-run.
