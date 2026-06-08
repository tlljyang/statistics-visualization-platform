# Regression Source Comparison

Date: 2026-06-06

## Scope

This document compares the three currently visible regression sources without
changing any app logic:

- `statistics-visualization-platform/apps/regression`
- `regression-visualizer`
- `code` / local checkout `regression_teaching`

The goal is to support a source-of-truth decision before any archive, mirror, or
code migration work.

## Summary Recommendation

Use `statistics-visualization-platform/apps/regression` as the current deployed
platform source for regression, pending owner confirmation.

Rationale:

- it is already registered in the platform shell
- it is included in `scripts/build.mjs`
- it built successfully as part of `npm run build:pages`
- it includes the expanded textbook regression datasets
- the public `code` checkout currently fails TypeScript compilation

`regression-visualizer` remains a useful upstream/reference repository because
it builds successfully and has a matching Hero-based structure, but the local
checkout currently has uncommitted changes on `codex/regression-hero-component`.

## Source Inventory

| Source | Local path | Branch/status | Build result | Notes |
| --- | --- | --- | --- | --- |
| Platform regression app | `statistics-visualization-platform/apps/regression` | In platform branch `codex/wals-module-migration`; only new integration docs are untracked at root | Passed through `npm run build:pages` | Registered in platform; has textbook datasets |
| Standalone private repo | `regression-visualizer` | `codex/regression-hero-component`; local checkout has uncommitted changes | `npm run build` passed | Similar structure to platform app, but lacks textbook datasets in local checkout |
| Public legacy/temp repo | `regression_teaching` / `code` | `main`; local checkout has uncommitted changes | `npm run build` failed | Has `InfoChip` and `regressionWorkbench` references not present in platform app |

## Structural Comparison

### Platform App vs `regression-visualizer`

Both sources share the same broad structure:

```text
src/components/Hero/
src/components/RegressionChart/
src/components/Sidebar/
src/components/StatisticsPanel/
src/d3/
src/main.ts
src/styles/custom.css
```

Notable differences:

- platform app has `public/data/textbook/`
- standalone repo local checkout only has the five original demo datasets
- several UI files differ, including Hero, chart view, sidebar view, statistics
  view, `src/main.ts`, and `custom.css`
- standalone repo has a generated `dist/` and `package-lock.json`
- standalone repo local checkout has uncommitted work on
  `codex/regression-hero-component`

### Platform App vs Public `code` Checkout

The public `code` checkout is more divergent.

Notable differences:

- platform app has `src/components/Hero/`; public `code` checkout has
  `src/components/InfoChip.ts`
- platform app has textbook datasets; public `code` checkout only has the five
  original demo datasets
- all core app files differ across `App`, `RegressionChart`, `Sidebar`,
  `StatisticsPanel`, `d3`, `main.ts`, and styles
- public `code` checkout contains `regressionWorkbench` references that do not
  resolve in the current local tree
- public `code` checkout has a `.github/` workflow and root `vite.config.ts`;
  platform app is nested under the platform build

## Build Evidence

Commands run from the local machine:

```bash
cd /Users/yixinyue/Desktop/统计学教学/statistics-visualization-platform
npm test
npm run build:pages
```

Observed result:

- root platform tests passed: 4 test files, 9 tests
- Pages build passed for the shell and all twelve app folders

```bash
cd /Users/yixinyue/Desktop/统计学教学/regression-visualizer
npm run build
```

Observed result:

- TypeScript and Vite build passed

```bash
cd /Users/yixinyue/Desktop/统计学教学/regression_teaching
npm run build
```

Observed result:

- build failed with missing `../../regressionWorkbench`
- build failed because `StatisticsPanelProps.controls` is required but not
  passed from `src/main.ts`
- build failed on a `clearSignal$` stream typing mismatch

## Source-of-Truth Decision

Recommended decision for now:

```text
Canonical deployed regression source:
  statistics-visualization-platform/apps/regression

Reference source:
  regression-visualizer

Legacy or experimental source:
  code / regression_teaching
```

This decision should remain provisional until the owner confirms whether the
uncommitted `regression-visualizer` branch changes should be merged into the
platform app.

## Safe Next Steps

1. Review the uncommitted `regression-visualizer` changes and decide whether
   they contain behavior or UI work that should be copied into the platform app.
2. Do not archive `regression-visualizer` until those changes are reviewed.
3. Treat public `code` as non-canonical unless its unfinished
   `regressionWorkbench` work is intentionally revived.
4. If owner agrees, add README archive/source-of-truth notes later:
   - `regression-visualizer` points to platform app as deployed source
   - `code` points to platform app or is archived as legacy
5. Keep the first pass behavior-preserving: no algorithm, interaction, or
   teaching-content changes.
