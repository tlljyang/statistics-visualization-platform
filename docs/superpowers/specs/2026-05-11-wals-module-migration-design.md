# WALS Module Migration Design

## Goal

Migrate the teaching templates from `Bayes-Cluster/WALS` into `Statistics-Learning-Teaching-Platform` as nine independent Cycle.js/Vite visualization repositories, then integrate those nine modules with the existing three visualizers in the unified `statistics-visualization-platform` site.

## Source Scope

The migration covers all WALS teaching modules under:

- `apps/Simulation/Introduction`
- `apps/Simulation/RandomVariable`
- `apps/Simulation/VarianceReduction`
- `apps/Simulation/Resampling`
- `apps/Simulation/MCMC`
- `apps/MES/ANOVA`
- `apps/MES/ConfidenceInterval`
- `apps/MES/Distributions`
- `apps/MES/LinearRegression`

WALS `frontend/simulation.html` references `QuasiMC`, but the current WALS `master` tree has no `apps/Simulation/QuasiMC` module, so it is not part of this migration.

## Repository Layout

Create one repository per WALS child module:

- `simulation-introduction-visualization`
- `simulation-random-variable-visualization`
- `simulation-variance-reduction-visualization`
- `simulation-resampling-visualization`
- `simulation-mcmc-visualization`
- `mes-anova-visualization`
- `mes-confidence-interval-visualization`
- `mes-distributions-visualization`
- `mes-linear-regression-visualization`

These sit alongside the existing repositories:

- `confidence-interval-visualization`
- `type-error-visualization`
- `regression-visualizer`

The unified platform keeps all twelve modules in one navigation surface.

## Application Architecture

Each new WALS repository is a standalone Vite + TypeScript + Cycle.js app. The app follows the same practical MVI separation used by the existing teaching visualizers:

- `src/main.ts` only bootstraps Cycle.js and global CSS.
- `src/components/<DomainApp>/intent.ts` maps DOM events into semantic actions.
- `src/components/<DomainApp>/model.ts` owns state, simulation algorithms, derived teaching summaries, and display props.
- `src/components/<DomainApp>/view.ts` renders state and composes child sections.
- `src/components/<DomainApp>/types.ts` declares raw state, controls, results, examples, and view model types.
- `src/d3/` owns chart drawing helpers where charts are non-trivial.
- `src/styles/custom.css` owns module styling.
- `src/utils/` owns small pure helpers such as number formatting and deterministic random generation.

Each module has page-level sections that mirror the source WALS tabs, but the Shiny/R implementation is rewritten into TypeScript so the result is a static GitHub Pages compatible web app.

## Platform Integration

`statistics-visualization-platform` remains the unified shell. Its registry expands from three visualizers to twelve visualizers and groups them as:

- Core Visualizers: existing confidence interval, type error, and regression apps.
- WALS Simulation: five migrated simulation modules.
- WALS MES: four migrated Modern Elementary Statistics modules.

The platform continues to build isolated app folders under `apps/<id>/` and load the active module in an iframe. This keeps each Cycle.js runtime isolated while presenting one user-facing website.

## Testing And Verification

Each new repository must include focused tests for:

- registry/config metadata
- simulation math or derived result helpers
- path/build assumptions needed for GitHub Pages

The platform must include tests that assert all twelve visualizers are registered in the expected grouped order.

Before publishing, run:

- `npm test` in each new module
- `npm run build` in each new module
- `npm test` in `statistics-visualization-platform`
- `npm run build:pages` in `statistics-visualization-platform`

## Publishing

Each module repository is created under `Statistics-Learning-Teaching-Platform`, but implementation work is submitted through review PRs rather than merged directly. New empty repositories may receive a minimal `main` branch with a README so GitHub has a base branch for pull requests; the actual migrated module code is pushed to `codex/<module-id>-migration` branches and opened as PRs.

The platform integration also stays on a `codex/wals-module-migration` branch and is opened as a PR against `statistics-visualization-platform:main`. The platform stores a deployable copy under `apps/<id>/` so the existing static Pages build can publish one integrated website after review and merge.
