---
model: claude-opus-4-6
template: big-feature
version: 1.0
---

# Big Feature Story

> [!IMPORTANT]
> **Before starting:** Run `/model claude-opus-4-6` in your Claude Code session.
> This template requires Opus — do not implement with a lighter model.

> **Model**: `claude-opus-4-6` — Use this template for large, multi-AC features with
> significant business logic, new screens, or complex interactions.

---

## Feature Title
<!-- One-line summary of what is being built -->

## Business Context
<!--
Why does this feature exist? What problem does it solve?
Include any OKRs, KPIs, or business goals this feature serves.
-->

## Personas
<!--
Who uses this feature? List 1-3 user personas with brief descriptions.
Example: "Sarah — a gym trainer who manages 20 clients' weekly programs"
-->

- **[Name]**: [Role and relevant context]
- **[Name]**: [Role and relevant context]

## User Story

As a **[persona]**,
I want to **[capability]**,
So that **[outcome/value]**.

## Acceptance Criteria
<!-- Each criterion must be independently testable. Use Given/When/Then format. -->

- [ ] **AC1**: Given [context], when [action], then [expected result]
- [ ] **AC2**: Given [context], when [action], then [expected result]
- [ ] **AC3**: Given [context], when [action], then [expected result]

## Technical Notes
<!--
Architecture decisions, constraints, implementation guidance.
Reference existing patterns in the codebase.
-->

- **Target app**: [`react-app` | `micro-frontend/host` | `micro-frontend/dashboard`]
- **State management**: [Zustand store / React local state / React context]
- **API integration**: [REST endpoint / mock data / existing store]
- **New files expected**: [`src/components/...`, `src/hooks/...`, `src/types/...`]
- **Performance considerations**: [lazy loading, pagination, virtual lists, etc.]
- **Error boundaries needed**: [yes — where / no]
- **Follow existing pattern from**: [path to similar component]

## Design Reference
<!--
Steps to extract design tokens and visual context from figma-to-code.
Run the extractor before filling this section.
-->

1. Run extractor: `cd figma-to-code && npm run run -- <nodeId>`
2. Design tokens: `figma-to-code/output/tokens.json`
3. Component structure: `figma-to-code/output/component-map.json`
4. Full layout data: `figma-to-code/output/structure.json`
5. Visual reference: `figma-to-code/output/screenshot.png` (attach to Claude prompt)
6. Summary: `figma-to-code/output/summary.md`

**Key tokens from this design** (paste relevant values after running extractor):
```
Colors:
Typography:
Spacing:
Shadows:
Border radius:
```

## Out of Scope
<!-- Explicitly list what this story does NOT cover. Prevents scope creep. -->

-
-

## Dependencies
<!-- Other stories, API endpoints, or infra that must be done first -->

- Blocked by: [story / ticket / PR]
- Depends on: [package / service / API]

## Test Strategy

- **Unit tests**: [List key components and hooks that need tests]
- **E2E tests**: [Key user flows to automate in Playwright]
- **Coverage target**: ≥ 80% (enforced by vitest thresholds — do not bypass)

## Definition of Done

- [ ] All ACs pass and have been manually verified
- [ ] Unit tests written, `npm run test:coverage` passes with ≥ 80%
- [ ] E2E test covers the primary happy path
- [ ] `tsc --noEmit` passes with zero errors
- [ ] `npm run lint` passes with zero warnings
- [ ] No `console.log` in production code
- [ ] Code reviewed and PR linked to this story
- [ ] Docker build succeeds: `docker build --target dev .`
- [ ] Accessibility checked (keyboard navigation + screen reader scan)
- [ ] Commit message follows Conventional Commits format
