# AI-Assisted Development Workflow

## Overview

This workspace uses a three-stage pipeline to go from design to production-ready UI:

```
[Figma] → figma-to-code → tokens + structure + screenshot
                                     ↓
                        User Story (template) + design artifacts
                                     ↓
                        Claude generates component + test + types
```

---

## Stage 1: Extract from Figma

### Setup (first time only)

```bash
cd figma-to-code
cp .env.example .env
# Fill in FIGMA_TOKEN and FIGMA_FILE_ID in .env
```

### Run

```bash
npm run run -- <nodeId>
# Optional flags:
#   --depth=N      how deep to traverse the node tree (default: full)
#   --scale=N      screenshot scale factor
#   --svg          export vector nodes as SVG
#   --out=DIR      custom output directory
```

### Outputs — what each file is used for

| File | Purpose in AI Prompt |
|------|---------------------|
| `tokens.json` | Colors, fonts, spacing, shadows, radii as structured JSON |
| `component-map.json` | Which components repeat and how many instances |
| `structure.json` | Full node tree with exact coordinates and visual properties |
| `screenshot.png` | Visual reference — **attach this image to your Claude prompt** |
| `summary.md` | Human-readable digest — paste into context for quick orientation |

---

## Stage 2: Write the User Story

### Choose the right template

| Story Size | Template | Model | When to Use |
|-----------|----------|-------|-------------|
| Large, multi-AC, new screens or complex business logic | `.claude/templates/big-feature.md` | `claude-opus-4-6` | New page/screen, major flows |
| Standard single-responsibility feature | `.claude/templates/feature.md` | `claude-sonnet-4-6` | New component, extending UI |
| Bug fix or regression | `.claude/templates/bugfix.md` | `claude-haiku-4-5` | Broken behavior |

### Where to save story files

```
.claude/stories/
  active/
    YYYY-MM-DD-<short-slug>.md    ← in-progress work
  done/
    YYYY-MM-DD-<short-slug>.md    ← completed, for reference
```

Example: `.claude/stories/active/2026-03-14-training-calendar.md`

### Fill in the template completely

The most critical fields before handing to Claude:
- **Big feature**: All ACs in Given/When/Then format, Out of Scope, Test Strategy
- **Feature**: ACs and Technical Notes (target files + patterns to follow)
- **Bugfix**: Steps to Reproduce, Actual Behavior (with error text), Fix Criteria

---

## Stage 3: Generate UI with Claude

### Prompt structure

```
Implement the following [feature | bugfix] in [react-app | micro-frontend/dashboard | micro-frontend/host].

STANDARDS: Follow all rules in CLAUDE.md (already in your context).

USER STORY:
---
[paste the completed template here]
---

DESIGN TOKENS (excerpt from figma-to-code/output/tokens.json):
---
[paste the relevant sections — colors, fonts, spacing, shadows]
---

DESIGN CONTEXT (figma-to-code/output/summary.md):
---
[paste the summary]
---

[Attach figma-to-code/output/screenshot.png as an image]

EXISTING CODE FOR REFERENCE:
---
[paste the most relevant existing component or store]
---

Please generate:
1. Component file(s) with full TypeScript strict types and explicit return types
2. Co-located test file(s) with ≥ 80% coverage
3. Any new types in src/types/
4. Any new hooks in src/hooks/
5. Updated index.ts barrel if adding a new component directory
6. Any Tailwind theme extensions needed for new design tokens
```

---

## Figma Token → Tailwind Mapping

When tokens don't map to default Tailwind classes, extend `tailwind.config.ts`:

```ts
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#5a57cb',   // ← from tokens.json: colors.primary
          light: '#726ee4',     // ← from tokens.json: colors.primaryLight
        },
      },
      boxShadow: {
        card: '0px 0px 4px 0px rgba(0, 0, 0, 0.1)',  // ← from tokens.json: shadows.card
      },
      borderRadius: {
        sm: '3px',   // ← from tokens.json: radii.sm
        md: '6px',   // ← from tokens.json: radii.md
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],  // ← from tokens.json: typography.fontFamily
      },
    },
  },
}
```

---

## Workflow by Template Type

### Big Feature (Opus)

1. Run `figma-to-code` extractor for the target Figma frame
2. Fill in `big-feature.md` completely — ACs, Out of Scope, and Test Strategy are mandatory
3. Provide `tokens.json` + `component-map.json` + screenshot + `summary.md`
4. Ask Claude for a **multi-file implementation plan first** — review and approve it before code generation
5. Claude generates all files; run `tsc --noEmit` + `vitest run --coverage` to verify

### Standard Feature (Sonnet)

1. Run `figma-to-code` if the feature has UI; skip if logic-only
2. Fill in `feature.md` — ACs and target files are the most critical fields
3. Provide `summary.md` excerpt and screenshot
4. Ask Claude to implement in one pass: component + test + types together
5. Verify with `tsc --noEmit` + `vitest run --coverage`

### Bug Fix (Haiku)

1. No Figma extraction needed unless fixing a visual regression
2. Fill in `bugfix.md` — Steps to Reproduce and Fix Criteria are critical
3. Ask Claude to: (a) identify root cause, (b) propose the minimal fix, (c) add regression test
4. Keep the prompt focused — Haiku is optimized for speed and precision on small tasks
5. Manually verify the fix in the browser after applying

---

## Quick Reference: File Locations

| What you need | Where to find it |
|--------------|-----------------|
| Coding standards | `CLAUDE.md` (workspace root) |
| Story templates | `.claude/templates/` |
| Active stories | `.claude/stories/active/` |
| Figma design tokens | `figma-to-code/output/tokens.json` |
| Figma screenshot | `figma-to-code/output/screenshot.png` |
| Figma summary | `figma-to-code/output/summary.md` |
| Shared types (micro-frontend) | `micro-frontend/packages/shared/src/types.ts` |
| Shared utilities (micro-frontend) | `micro-frontend/packages/shared/src/utils.ts` |
| Shared types (react-app) | `react-app/src/types/index.ts` |
| Shared utilities (react-app) | `react-app/src/utils/index.ts` |
