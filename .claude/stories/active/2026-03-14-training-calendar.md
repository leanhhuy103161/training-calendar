---
model: claude-opus-4-6
template: big-feature
version: 1.0
---

# Big Feature Story

> **Model**: `claude-opus-4-6` — Use this template for large, multi-AC features with
> significant business logic, new screens, or complex interactions.

---

## Feature Title
<!-- One-line summary of what is being built -->
Build out a calendar to manage working training

## Business Context
Build out a calendar to manage working training. Should be able to:
Rearrange workouts between days while maintaining the positions as dragged and dropped.
Rearrange exercises between workouts while maintaining the positions as dragged and dropped.
The UI should match the design as closely as possible. Pay attention to details such as colors, fonts, and element sizes, ...
There is NO warning error in the console.


## Acceptance Criteria

- [ ] **AC0**: Given the calendar UI, when a user views the calendar, the tokens, variants from figma must be setup in tailwind theme if it not existing yet, then the calendar should visually match the design reference as closely as possible.
- [ ] **AC1**: Given a calendar with scheduled workouts, when a user drags and drops a workout to a different day, then the workout should maintain its position relative to other workouts on the new day.
- [ ] **AC2**: Given a workout with multiple exercises, when a user drags and drops an exercise to a different position within the same workout, then the exercise should maintain its position relative to other exercises in the workout.
- [ ] **AC3**: Given the calendar UI, when a user inspects the page, then there should be no warning errors in the console.
- [ ] **AC4**: Given the calendar UI, when a user compares it to the design reference, then the colors, fonts, and element sizes should match the design as closely as possible.

## Technical Notes

- **Target app**: [`react-app`]
- **State management**: [React Context + useReducer]
- **API integration**: [existing store]
- **New files expected**: [`src/components/...`, `src/hooks/...`, `src/types/...`]
- **Performance considerations**: [Require Accessibility like label, aria, ...]
- **Error boundaries needed**: [No error boundaries needed for this feature]
- **Follow existing pattern from**: [follow in current react-app codebase for similar features]

## Design Reference
Commaned was run and all inforamtion was placed in the `figma-to-code/output` folder. Key files to reference for this story:

2. Design tokens: `figma-to-code/output/tokens.json`
3. Component structure: `figma-to-code/output/component-map.json`
4. Full layout data: `figma-to-code/output/structure.json`
5. Visual reference: `figma-to-code/output/screenshot.png` (attach to Claude prompt)
6. Summary: `figma-to-code/output/summary.md`

**Key tokens from this design** (relevant values after running extractor):
Use relevant tokens from `tokens.json` to specify colors, fonts, spacing, etc. For example:

## Dependencies
- Blocked by: No Blocks
- Depends on: No Dependencies

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
