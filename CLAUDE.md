# CLAUDE.md — AI Agent Development Standards

This file defines the rules and conventions all AI agents **must** follow when working in
this repository. These rules are non-negotiable unless the user explicitly overrides them
for a specific task.

When implementing any feature or bugfix, always read `.claude/workflow.md` for the
full Figma-to-code pipeline and prompt structure before starting.

---

## 1. Workspace Layout

```
ai-workflow/
  react-app/            ← Standalone React 19 SPA (Vite + Tailwind CSS 4 + TypeScript)
  figma-to-code/        ← Figma API extractor — READ ONLY design token source
  .claude/
    templates/          ← User story templates (big-feature, feature, bugfix)
    stories/            ← Active and completed user story tickets
    workflow.md         ← Figma-to-code AI workflow guide
```

---

## 2. TypeScript Conventions

- `strict: true` is required in every `tsconfig.json` — never disable strict mode
- **Never use `any`** — use `unknown` with type narrowing, or proper generics
- Always declare **explicit return types** on exported functions and components
- Prefer `interface` over `type` for object shapes; use `type` for unions, aliases, and mapped types
- Use `readonly` for props and immutable data structures
- Use `satisfies` operator for config objects to catch type errors at declaration site
- Never use non-null assertion (`!`) unless the value is provably non-null (e.g., `document.getElementById('root')!`)

---

## 3. React & Component Conventions

- Write **only functional components** — never class components except React Error Boundaries
- Keep components small and single-purpose (under 150 lines is a strong guideline)
- Extract logic into **custom hooks** in `src/hooks/` when state logic exceeds ~10 lines
- Component files live in `src/components/<component-name>/` with an `index.ts` barrel export
- Co-locate tests: `ComponentName.test.tsx` next to `ComponentName.tsx`
- Export components as **named exports** from `index.ts`; default export from the component file itself

```
src/components/
  metric-card/
    MetricCard.tsx         ← default export
    MetricCard.test.tsx    ← colocated unit test
    index.ts               ← export { default } from './MetricCard'
```

---

## 4. File and Folder Naming

| Type | Convention | Example |
|------|-----------|---------|
| Directories | `kebab-case` | `training-calendar/` |
| Component files | `PascalCase.tsx` | `TrainingCalendar.tsx` |
| Hook files | `camelCase.ts` | `useTrainingData.ts` |
| Utility files | `kebab-case.ts` | `format-date.ts` |
| Type files | `kebab-case.ts` | `training-types.ts` |
| Unit test files | `*.test.tsx` | `MetricCard.test.tsx` |
| E2E test files | `*.spec.ts` | `training-flow.spec.ts` |

---

## 5. Import Conventions

- Use `@/` path alias for **all** internal imports (mapped to `src/`)
- Never use relative paths that go more than one level up (`../../..`)
- Group imports in this order: external packages → `@/` internal → relative

---

## 6. Commit Conventions (Conventional Commits)

**Format:** `<type>(<scope>): <description>`

**Types:** `feat` | `fix` | `chore` | `test` | `docs` | `refactor` | `perf` | `ci`

**Scopes:** `react-app` | `host` | `dashboard` | `shared` | `e2e` | `docker` | `ci` | `figma`

**Rules:**
- Description is **lowercase**, imperative mood ("add" not "adds" or "added")
- Body explains the "why" when the change is non-obvious
- Breaking changes use `!`: `feat(host)!: change module federation API`
- Reference issue/story in footer: `Closes #42`

```
feat(dashboard): add metric card hover animation
fix(host): resolve sidebar toggle state on mobile
test(shared): add coverage for cn utility edge cases
chore(react-app): add TypeScript configuration
refactor(dashboard): extract ActivityFeed to standalone component
```

---

## 7. Git Hygiene

- **Never force-push to `main`** — always use PRs and merge commits
- Branch naming: `feature/<description>` | `fix/<description>` | `chore/<description>`
- Keep commits atomic — one logical change per commit
- Never commit: `node_modules/` | `dist/` | `.env` | `coverage/` | `playwright-report/`
- Run `npm test` (or `pnpm test`) before pushing

---

## 8. Testing Standards

- **Minimum 80% coverage** enforced on lines, functions, branches, and statements via Vitest thresholds
- Unit tests use **Vitest** + `@testing-library/react`
- Write tests in `*.test.tsx` co-located with the component
- E2E tests use **Playwright**, located in `e2e/tests/*.spec.ts`
- Test **behavior**, not implementation — avoid testing internal state directly
- Prefer ARIA role queries; use `data-testid` only as last resort

---

## 9. UI Conventions

- Use **Tailwind CSS only** — no inline `style` props, no CSS-in-JS, no custom CSS files
- All spacing, color, and typography must map to Tailwind utilities
- When design tokens come from `figma-to-code/output/tokens.json`, translate them to
  `tailwind.config.ts` `theme.extend` entries — never use magic hex values inline
- Use `cn()` utility from `@/utils` to compose conditional class names

---

## 10. Error Handling

- **Never swallow errors** — empty `catch` blocks are forbidden
- Always provide error messages actionable to the user
- Use React Error Boundaries for component subtrees that load remote data
- Log only with `console.warn` or `console.error` — **never `console.log` in production code**
- Every async function must handle rejection: `try/catch` or `.catch()`

---

## 11. Accessibility

- Use semantic HTML: `<main>`, `<nav>`, `<aside>`, `<article>`, `<section>`, `<header>`, `<footer>`
- Every interactive element must be **keyboard-accessible** (focusable, operable with Enter/Space)
- Images require `alt` text; decorative images use `alt=""`
- Modals/dialogs need `role="dialog"` and `aria-modal="true"`
- Form inputs require an associated `<label>` (via `htmlFor` or wrapping)
- Use `aria-label` when no visible label text is present

---

## 12. Performance

- **Lazy-load routes**: `const Page = lazy(() => import('@/pages/PageName'))`
- **Lazy-load heavy components** (charts, rich text editors, large tables)
- Always wrap lazy-loaded components in `<Suspense fallback={<Spinner />}>`
- Avoid creating new objects/arrays in component render scope
- Use `useCallback` and `useMemo` only when there is a **measured** performance benefit, not preemptively

---

## 13. Agent Self-Check (Before Proposing Code)

Before presenting any code change to the user, verify:

- [ ] No `any` types
- [ ] No `console.log` statements (only `console.warn` / `console.error`)
- [ ] Explicit return types on all exported functions
- [ ] Test file created/updated alongside new components
- [ ] All imports use `@/` alias (no deep relative paths)
- [ ] Component directory has `index.ts` barrel export
- [ ] No inline `style` props — Tailwind classes only
- [ ] Accessible markup (semantic elements, ARIA where needed)
- [ ] Error cases handled (no empty catch blocks)
- [ ] Commit message follows Conventional Commits format
