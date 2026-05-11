# WALS Module Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build nine WALS-derived teaching visualization repositories and integrate them with the existing three modules in the unified statistics visualization platform through review PRs, without merging directly.

**Architecture:** Generate nine standalone Cycle.js/Vite apps from a shared template, with per-module content/config driving the simulation tabs, controls, charts, and results. Copy those apps into `statistics-visualization-platform/apps/<id>/`, expand the platform registry to twelve modules, and publish each generated module to its own org repository.

**Tech Stack:** TypeScript, Vite, Cycle.js, xstream, D3, Vitest, GitHub CLI, GitHub Pages.

---

### Task 1: Protect Local Brainstorming Artifacts

**Files:**
- Modify: `.gitignore`

- [x] **Step 1: Ignore `.superpowers/`**

Add `.superpowers/` to `.gitignore` so visual companion files do not enter commits.

- [x] **Step 2: Create migration branch**

Run: `git checkout -b codex/wals-module-migration`

Expected: branch switches to `codex/wals-module-migration`.

### Task 2: Write Migration Spec And Plan

**Files:**
- Create: `docs/superpowers/specs/2026-05-11-wals-module-migration-design.md`
- Create: `docs/superpowers/plans/2026-05-11-wals-module-migration.md`

- [x] **Step 1: Document source scope**

List the five WALS Simulation modules and four WALS MES modules.

- [x] **Step 2: Document target repositories**

List the nine target repository names and the three existing repositories they will join.

- [x] **Step 3: Document MVI architecture**

Specify clean `main.ts`, domain `intent/model/view/types`, `d3`, `styles`, and `utils` ownership.

### Task 3: Add Platform Tests For Twelve Modules

**Files:**
- Modify: `test/visualizers.test.ts`
- Modify: `src/visualizers.ts`

- [ ] **Step 1: Write failing registry test**

Update `test/visualizers.test.ts` to expect these ids in order:

```ts
[
  "confidence-interval",
  "type-error",
  "regression",
  "simulation-introduction",
  "simulation-random-variable",
  "simulation-variance-reduction",
  "simulation-resampling",
  "simulation-mcmc",
  "mes-anova",
  "mes-confidence-interval",
  "mes-distributions",
  "mes-linear-regression"
]
```

Run: `npm test -- test/visualizers.test.ts`

Expected: FAIL because only the original three visualizers are registered.

- [ ] **Step 2: Add grouped registry metadata**

Extend `VisualizerLink` with `group`, `shortLabel`, `repositoryUrl`, and `source`. Register all twelve visualizers.

- [ ] **Step 3: Run registry tests**

Run: `npm test -- test/visualizers.test.ts`

Expected: PASS.

### Task 4: Generate The Nine WALS Apps

**Files:**
- Create: `scripts/generate-wals-apps.mjs`
- Create: `apps/simulation-introduction/`
- Create: `apps/simulation-random-variable/`
- Create: `apps/simulation-variance-reduction/`
- Create: `apps/simulation-resampling/`
- Create: `apps/simulation-mcmc/`
- Create: `apps/mes-anova/`
- Create: `apps/mes-confidence-interval/`
- Create: `apps/mes-distributions/`
- Create: `apps/mes-linear-regression/`

- [ ] **Step 1: Generate app scaffolds**

Create a generator that writes consistent Vite/Cycle.js apps with:

```text
index.html
package.json
tsconfig.json
vite.config.ts
src/main.ts
src/components/<DomainApp>/intent.ts
src/components/<DomainApp>/model.ts
src/components/<DomainApp>/view.ts
src/components/<DomainApp>/types.ts
src/components/<DomainApp>/index.ts
src/d3/charts.ts
src/styles/custom.css
src/utils/format.ts
src/utils/random.ts
test/module.test.ts
```

- [ ] **Step 2: Encode per-module teaching content**

Put the WALS tab structure, controls, and simulation examples into module configs for all nine modules.

- [ ] **Step 3: Run generated module tests**

Run: `npm test --workspaces --if-present`

Expected: all generated app tests pass.

- [ ] **Step 4: Run generated module builds**

Run each generated module's `npm run build`.

Expected: all nine modules build successfully.

### Task 5: Integrate WALS Apps Into Platform Build

**Files:**
- Modify: `scripts/build.mjs`
- Modify: `src/main.ts`
- Modify: `src/styles.css`
- Modify: `src/visualizers.ts`
- Modify: `test/visualizers.test.ts`

- [ ] **Step 1: Expand build app list**

Add the nine new `apps/<id>` folders to `scripts/build.mjs` with matching `baseSegment` values.

- [ ] **Step 2: Add grouped platform navigation**

Render visualizer buttons grouped by Core Visualizers, WALS Simulation, and WALS MES.

- [ ] **Step 3: Run platform tests**

Run: `npm test`

Expected: all platform tests pass.

- [ ] **Step 4: Run full Pages build**

Run: `npm run build:pages`

Expected: one `dist/` containing the platform shell and twelve built app folders.

### Task 6: Create Nine Repositories And Open Module PRs

**Files:**
- New local repo directories under `/Users/yixinyue/Desktop/统计学教学/<repo-name>/`

- [ ] **Step 1: Create org repositories with minimal base branches**

Run `gh repo create Statistics-Learning-Teaching-Platform/<repo-name> --private --description "<description>" --add-readme` for each missing repository. This creates only the base branch needed for review PRs.

- [ ] **Step 2: Copy each generated app onto a feature branch**

Clone each repository, create `codex/<id>-migration`, and copy the matching `apps/<id>/` folder into the branch, preserving source layout.

- [ ] **Step 3: Commit and push each module branch**

For each repo, run:

```bash
git add .
git commit -m "feat: migrate WALS module"
git push -u origin codex/<id>-migration
```

Expected: all nine repositories have an unmerged feature branch containing a working app.

- [ ] **Step 4: Open review PRs**

For each repo, run:

```bash
gh pr create --repo Statistics-Learning-Teaching-Platform/<repo-name> --base main --head codex/<id>-migration --title "feat: migrate WALS <module name> module" --body "<summary and verification>"
```

Expected: all nine module changes are available as PRs for review, not merged.

### Task 7: Final Verification And Platform PR

**Files:**
- All generated app folders
- Platform registry/build/style files

- [ ] **Step 1: Verify local git status**

Run: `git status --short`

Expected: only intentional platform files and generated app folders are modified or added.

- [ ] **Step 2: Run final verification**

Run: `npm test` and `npm run build:pages`.

Expected: both commands exit successfully.

- [ ] **Step 3: Commit platform integration branch**

Run:

```bash
git add .
git commit -m "feat: integrate WALS teaching modules"
```

- [ ] **Step 4: Push platform branch and open PR**

Run:

```bash
git push -u origin codex/wals-module-migration
gh pr create --repo Statistics-Learning-Teaching-Platform/statistics-visualization-platform --base main --head codex/wals-module-migration --title "feat: integrate WALS teaching modules" --body "<summary and verification>"
```

Expected: platform migration branch is available as an unmerged PR for review.
