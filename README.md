# AI-Assisted Development Workflow

This document explains the end-to-end process used to deliver this assignment — from receiving the task, through AI-assisted development, to the final commit and handoff.

![Design Reference](figma-to-code/output/screenshot.png)

---

## Table of Contents

1. [Assignment Overview](#1-assignment-overview)
2. [Preparation — The AI Workflow Setup](#2-preparation--the-ai-workflow-setup)
3. [Analyzing the Requirements](#3-analyzing-the-requirements)
4. [Writing the User Story](#4-writing-the-user-story)
5. [Extracting Design Tokens from Figma](#5-extracting-design-tokens-from-figma)
6. [Planning with the Agent](#6-planning-with-the-agent)
7. [Agent Execution](#7-agent-execution)
8. [Review and UI Verification](#8-review-and-ui-verification)
9. [Testing](#9-testing)
10. [Committing](#10-committing)
11. [Handoff](#11-handoff)

---

## 1. Assignment Overview

The assignment was to build a **weekly training calendar** with the following core features:

- A 7-column layout showing each day of the week
- Workout cards grouped within each day, each containing a list of exercises
- Drag-and-drop reordering of workouts between days
- Drag-and-drop reordering of exercises between workouts
- UI fidelity as close as possible to the provided Figma design
- Zero console warnings or errors
- Bonus: Add/Edit forms for workouts and exercises

The stack was already decided: **React 19 + Vite + Tailwind CSS v4 + TypeScript (strict) + React Context + dnd-kit**.

---

## 2. Preparation — The AI Workflow Setup

Before touching any code, I prepared the **AI development environment** so the agent could operate with consistent standards throughout the session.

### CLAUDE.md — The Agent's Rulebook

`CLAUDE.md` (at the workspace root) defines non-negotiable conventions the agent must follow at all times:

- TypeScript strict mode, no `any`, explicit return types on all exported functions
- Functional components only, custom hooks for logic exceeding ~10 lines
- Tailwind CSS only — no inline styles, no CSS-in-JS
- Design tokens from Figma must be translated to `@theme` in `index.css`
- Minimum 80% test coverage enforced via Vitest thresholds
- Conventional Commits format for all commit messages
- Accessibility: semantic HTML, ARIA labels, keyboard navigation

This file is loaded into every Claude Code session automatically, so the agent always has the rules in context.

### User Story Templates

Three templates live in `.claude/templates/`:

| Template | Model | When to use |
|----------|-------|-------------|
| `big-feature.md` | Claude Opus | Large features with complex business logic or new screens |
| `feature.md` | Claude Sonnet | Standard single-responsibility features or component extensions |
| `bugfix.md` | Claude Haiku | Focused bug fixes and regressions |

Each template prompts for Acceptance Criteria in Given/When/Then format, Technical Notes (target files, patterns to follow), Design References, and a Definition of Done checklist. This structure ensures the agent receives complete, unambiguous instructions.

### figma-to-code Module

The `figma-to-code/` directory is a dedicated extractor that pulls data directly from the Figma API. Running it against a Figma frame produces:

| Output File | What it Contains |
|-------------|-----------------|
| `tokens.json` | Colors, fonts, spacing, shadows, border radii as structured JSON |
| `component-map.json` | Repeating components and their instance counts |
| `structure.json` | Full node tree with exact coordinates and visual properties |
| `screenshot.png` | Visual reference image — attached directly to the Claude prompt |
| `summary.md` | Human-readable design digest |

This eliminates manual inspection of Figma and gives the agent precise, machine-readable design data to work from.

---

## 3. Analyzing the Requirements

After receiving the assignment, I read the requirements carefully, focusing on:

- **Inputs**: What data does the UI need? (A week of days, each with workouts and exercises)
- **Outputs**: What does the user see and interact with? (Drag-and-drop calendar grid)
- **Functionality**: What are the exact behaviors? (Cross-day workout moves, cross-workout exercise moves, position preservation)
- **Constraints**: Pixel-accuracy to Figma, zero console errors, accessibility

Any unclear points were confirmed with the assignment provider before starting.

---

## 4. Writing the User Story

With requirements confirmed, I filled in the **Big Feature template** (Opus-tier, since this involves a new screen with non-trivial state and DnD interactions).

The completed story lives at `.claude/stories/active/2026-03-14-training-calendar.md` and includes:

- **Business Context**: Plain-language explanation of what the calendar does
- **Acceptance Criteria**: Each AC written in testable terms (AC0 through AC4), covering visual fidelity, drag-and-drop behavior, and zero console errors
- **Technical Notes**: Target app (`react-app`), state management approach (React Context + useReducer), and a pointer to reference patterns in the codebase
- **Design Reference**: Paths to all `figma-to-code` outputs
- **Test Strategy**: Which components need unit tests, which flows need E2E coverage
- **Definition of Done**: Checklist including coverage thresholds, lint, TypeScript, accessibility, and Conventional Commits

This document becomes the **single source of truth** passed to the agent. It removes ambiguity and grounds every decision the agent makes.

---

## 5. Extracting Design Tokens from Figma

Before prompting the agent, I ran the `figma-to-code` extractor against the calendar Figma frame:

```bash
cd figma-to-code
npm run run -- <nodeId>
```

The output was placed in `figma-to-code/output/`. The key data fed to the agent:

- **Colors** from `tokens.json`: `#5a57cb` (workout title), `#6a7988` (day header), `#919cad` (exercise sets), etc.
- **Typography**: Open Sans font family, specific size/weight combinations per element
- **Spacing**: Card padding, column gaps, header dimensions
- **Effects**: `0px 0px 4px rgba(0,0,0,0.1)` card shadow, `3px` and `6px` border radii
- **Screenshot** (`screenshot.png`): Attached as an image directly in the Claude prompt for visual reference

These tokens were translated into `@theme` variables in `src/index.css`, making them available as semantic Tailwind utilities (`text-workout-title`, `bg-day-bg`, `shadow-card`, etc.) throughout the entire codebase.

---

## 6. Planning with the Agent

Before asking the agent to write any code, I requested an **explicit implementation plan**:

> "Before doing anything, prepare a plan for what you will implement step by step. Let me review and adjust it before you start."

The plan covered:
1. Type definitions (`Exercise`, `Workout`, `CalendarDay`, drag data types)
2. React Context + useReducer (`moveWorkout`, `moveExercise` mutations)
3. Mock data structure for the initial week
4. Component hierarchy: `TrainingCalendar` → `DayColumn` → `WorkoutCard` → `ExerciseCard`
5. `useCalendarDnd` hook — drag state, sensors, event handlers
6. Tailwind theme extensions from Figma tokens
7. Co-located unit tests for each piece
8. E2E tests in Playwright

I reviewed this plan, adjusted scope and ordering where needed, and only approved execution once the plan matched my expectations. This step prevents the agent from going in a wrong direction for 20 minutes before you notice.

---

## 7. Agent Execution

With the approved plan, the agent worked step by step following the rules baked into `CLAUDE.md`:

**What the agent did automatically:**
- Strict TypeScript throughout — no `any`, `readonly` props, explicit return types
- Extracted drag logic into a custom hook (`useCalendarDnd`) rather than bloating components
- Co-located test files (`ComponentName.test.tsx`) alongside each component
- Registered all Figma design tokens in `src/index.css` `@theme` block
- Used React Context + useReducer for shared state with immutable update patterns
- Semantic HTML + ARIA labels on every interactive element
- `cn()` utility for all conditional class composition

**Conventions the agent maintained at all times:**
- Component directory structure with `index.ts` barrel exports
- Import alias `@/` for all internal imports
- Tailwind-only styling — zero inline `style` props
- `console.warn` / `console.error` only — no `console.log` in production code

---

## 8. Review and UI Verification

After the agent finished, I reviewed the output:

**Code review checklist:**
- [ ] No `any` types anywhere
- [ ] All exported functions have explicit return types
- [ ] No empty `catch` blocks
- [ ] Component files stay under ~150 lines
- [ ] Every new component has a co-located test file
- [ ] Barrel exports (`index.ts`) in place for all new component directories

**UI verification against Figma:**
The agent typically achieves **70–80% visual accuracy** from the Figma tokens and screenshot alone. After the initial pass, I compared the rendered output against `figma-to-code/output/screenshot.png` and guided the agent to close the remaining gaps:

- Exact pixel values for padding, gap, and width classes
- Font weight and letter-spacing refinements
- Drag ghost styling and cursor states
- Hover state color transitions
- Today indicator (bold purple date number for the current day)

This feedback loop — agent generates → I compare to Figma → agent refines — typically takes 1–2 iterations to reach a satisfactory level of fidelity.

---

## 9. Testing

Testing was enforced at two levels:

### Unit Tests (Vitest + Testing Library)

- **Coverage threshold**: 80% on lines, functions, branches, and statements — enforced by `vitest.config.ts`. Tests will fail the CI run if coverage drops below this.
- **Test location**: Co-located with each component (`ComponentName.test.tsx`) and hook (`hookName.test.ts`)
- **What was tested**: Rendered output, ARIA roles and labels, user interactions (click to open modal, form submit, delete), store mutations (add/update/delete for workouts and exercises), drag state transitions

Run unit tests:
```bash
cd react-app
npm test                   # run once
npm run test:watch         # watch mode
npm run test:coverage      # with coverage report
```

### E2E Tests (Playwright)

Playwright tests in `e2e/tests/training-calendar.spec.ts` cover:
- Calendar renders all 7 day columns
- Existing workouts and exercises visible on load
- Add Workout modal opens, validates, and adds a new workout
- Edit Workout modal pre-fills values, updates on save, deletes on Delete
- Add Exercise modal opens from workout card and adds a new exercise
- Edit Exercise modal opens on exercise hover/click, updates on save
- Today's date is visually distinct (bold purple)

Run E2E tests:
```bash
cd react-app
npm run test:e2e
```

---

## 10. Committing

Once everything was reviewed and tests were passing, **I committed the changes myself** — not the agent. This is intentional: the human owns the final commit.

The commit process is guarded by Husky hooks configured in the project:

**`pre-commit`** runs:
- ESLint — zero warnings allowed
- TypeScript check (`tsc --noEmit`) — zero errors

**`pre-push`** runs:
- Full unit test suite (`vitest run`)
- E2E tests (`playwright test`)

If any hook fails, the commit or push is blocked. This prevents broken code from ever reaching the remote branch.

Commit messages follow **Conventional Commits**:

```
feat(dashboard): add training calendar with drag-and-drop
feat(dashboard): add workout and exercise add/edit modals
chore(react-app): add tailwind font-size tokens and translation file
```

Format: `<type>(<scope>): <description>` — lowercase, imperative mood, referencing the story in the footer.

---

## 11. Handoff

After pushing, I notified the next person in the chain (reviewer / QA/ assigner) with:

2. **What was built** — brief summary of all features implemented (calendar layout, drag-and-drop, add/edit modals)
3. **How to verify** — instructions to run `npm run dev`, `npm test`, and `npm run test:e2e`
4. **Known gaps or trade-offs** — anything that was intentionally out of scope or requires a follow-up
5. **Next steps** — any remaining work suggested for the next iteration (e.g., backend integration, real API data, delete confirmation dialogs)

---

## Repository Structure

```
ai-workflow/
├── CLAUDE.md                          ← Agent rules and conventions (non-negotiable)
├── README.md                          ← This file
├── .claude/
│   ├── workflow.md                    ← Full Figma-to-code pipeline guide
│   ├── templates/
│   │   ├── big-feature.md             ← Opus story template
│   │   ├── feature.md                 ← Sonnet story template
│   │   └── bugfix.md                  ← Haiku story template
│   └── stories/
│       └── active/
│           └── 2026-03-14-training-calendar.md   ← This assignment's story
├── figma-to-code/                     ← Figma API extractor (design tokens, screenshots)
│   └── output/
│       ├── tokens.json
│       ├── screenshot.png
│       ├── structure.json
│       ├── component-map.json
│       └── summary.md
└── react-app/                         ← The deliverable
    └── src/
        ├── components/
        │   ├── training-calendar/     ← Calendar, DayColumn, WorkoutCard, ExerciseCard
        │   ├── modal/                 ← Shared Modal base component
        │   ├── workout-form-modal/    ← Add/Edit workout form
        │   └── exercise-form-modal/  ← Add/Edit exercise form
        ├── data/
        │   ├── translations.ts        ← All UI strings, centralized
        │   ├── mock-week.ts           ← Initial calendar data
        │   └── constant.ts            ← DnD type constants
        ├── hooks/
        │   └── useCalendarDnd.ts      ← All drag-and-drop logic
        ├── stores/
        │   └── calendar-store.tsx     ← React Context + useReducer store with full CRUD
        └── types/
            └── index.ts               ← TypeScript interfaces
```
