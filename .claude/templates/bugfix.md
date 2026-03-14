---
model: claude-haiku-4-5
template: bugfix
version: 1.0
---

# Bug Report

> [!IMPORTANT]
> **Before starting:** Run `/model claude-haiku-4-5` in your Claude Code session.
> This template requires Haiku — keep prompts focused and specific.

> **Model**: `claude-haiku-4-5` — Use this template for bug fixes, regressions,
> and broken behavior. Keep prompts focused and specific for fastest resolution.

---

## Bug Title
<!-- Format: "[Component/Area]: Short description of what is broken" -->

## Environment

- **App**: [`react-app` | `micro-frontend/host` | `micro-frontend/dashboard`]
- **Browser**: [Chrome / Firefox / Safari / all]
- **OS**: [macOS / Windows / Linux]
- **Node version**:
- **Reproducible in Docker**: [yes / no / not tested]

## Steps to Reproduce

1.
2.
3.

## Expected Behavior
<!-- What should happen? -->

## Actual Behavior
<!-- What actually happens? Paste error messages and console output verbatim. -->

```
[paste error / console output here]
```

## Root Cause Hypothesis
<!-- If you know or suspect why this is happening, note it. -->

## Fix Criteria
<!-- What must be true for this bug to be considered fixed? -->

- [ ] [Specific verifiable criterion]
- [ ] No regression in [related area]

## Files Likely Involved

- `src/...`
- `src/...`

## Regression Test to Add
<!-- A specific test that would have caught this bug and will prevent recurrence. -->

- [ ] Add test to `[file path]` asserting [specific behavior]

## Definition of Done

- [ ] Fix criteria met
- [ ] Regression test added and passes
- [ ] `tsc --noEmit` + `eslint` clean
- [ ] Manually verified in browser
- [ ] Commit: `fix(<scope>): <description>` following Conventional Commits
