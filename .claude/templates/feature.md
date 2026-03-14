---
model: claude-sonnet-4-6
template: feature
version: 1.0
---

# Feature Story

> [!IMPORTANT]
> **Before starting:** Run `/model claude-sonnet-4-6` in your Claude Code session.
> This template requires Sonnet.

> **Model**: `claude-sonnet-4-6` — Use this template for standard single-responsibility
> features: new components, extending existing UI, adding interactions.

---

## Feature Title
<!-- One-line summary -->

## User Story

As a **[persona]**,
I want to **[capability]**,
So that **[outcome]**.

## Acceptance Criteria

- [ ] **AC1**: [Specific, testable criterion]
- [ ] **AC2**: [Specific, testable criterion]
- [ ] **AC3**: [Specific, testable criterion]

## Technical Notes
<!-- Implementation approach, file locations, patterns to reuse -->

- **Target app**: [`react-app` | `micro-frontend/host` | `micro-frontend/dashboard`]
- **Target files**: [`src/components/...`, `src/hooks/...`]
- **State**: [local state / name of Zustand store]
- **Follow pattern from**: [path to existing component to reference]

## Design Reference

- Figma tokens: `figma-to-code/output/tokens.json`
- Screenshot: `figma-to-code/output/screenshot.png` (attach to Claude prompt)
- **Key values** (paste from tokens.json):
  ```
  Primary color:
  Font:
  Spacing:
  ```

## Tests Required

- [ ] Unit: `src/components/<name>/<name>.test.tsx`
- [ ] Unit: `src/hooks/<name>.test.ts` *(if adding a hook)*
- [ ] E2E smoke: `e2e/tests/<feature>.spec.ts`

## Definition of Done

- [ ] ACs pass
- [ ] Tests written, coverage ≥ 80%
- [ ] `tsc --noEmit` + `eslint` clean
- [ ] No `console.log` in production code
- [ ] PR linked to this story with Conventional Commits message
