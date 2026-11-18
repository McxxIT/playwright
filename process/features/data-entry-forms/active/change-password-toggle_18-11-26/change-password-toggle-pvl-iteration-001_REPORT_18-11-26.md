---
type: pvl-iteration-report
plan: change-password-toggle_PLAN_18-11-26.md
iteration: 1
date: 2026-11-18
---

# PVL Iteration 001

- **Input gate:** CONDITIONAL (0 FAIL, 2 CONCERN)
  1. Login on version-13p0j unverified, so browser tests could not be confirmed.
  2. Whether the value syncs between the masked and plain inputs was unknown.
- **Evidence:** vc-debugger live probe on version-13p0j:
  - `--project=setup` passes; the earlier failure came from a stale `/version-43jga` BASE_URL.
  - Plain inputs are absent at load and created on the first toggle, carrying the same value.
  - The masked input goes `display:none`.
  - The icon href toggles between `#eye-off` and `#eye`.
- **Fix applied:** vc-plan-agent supplement:
  - folded in the probe findings;
  - added automated icon assertions;
  - added the `toBeHidden()` rule;
  - replaced E3;
  - reset the contract to a placeholder.
- **Gaps addressed:** 2
- **Remaining:** S5 (reverse sync, plain input back to masked) is unprobed; it runs as `expect.soft`.
- **Next:** re-run vc-validate-agent from V1.
