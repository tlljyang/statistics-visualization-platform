# Platform Integration Inventory

Date: 2026-06-06

## Scope

This inventory records the current integration state of
`statistics-visualization-platform`. It is documentation-only and must not be
read as approval to change teaching logic, statistical calculations, app
interactions, or visual behavior.

## Current Platform State

The platform branch currently contains twelve app folders under `apps/`.

```text
apps/confidence-interval
apps/type-error
apps/regression
apps/simulation-introduction
apps/simulation-random-variable
apps/simulation-variance-reduction
apps/simulation-resampling
apps/simulation-mcmc
apps/mes-anova
apps/mes-confidence-interval
apps/mes-distributions
apps/mes-linear-regression
```

The root shell loads apps through `src/visualizers.ts`, renders grouped
navigation in `src/main.ts`, and builds app copies through `scripts/build.mjs`.

## App Registry Inventory

| App id | Group | Platform path | Source repository | Source type | Platform status |
| --- | --- | --- | --- | --- | --- |
| `confidence-interval` | Core Visualizers | `apps/confidence-interval/` | `confidence-interval-visualization` | Existing standalone app | Registered and present |
| `type-error` | Core Visualizers | `apps/type-error/` | `type-error-visualization` | Existing standalone app | Registered and present |
| `regression` | Core Visualizers | `apps/regression/` | `regression-visualizer` | Existing standalone app | Registered and present |
| `simulation-introduction` | WALS Simulation | `apps/simulation-introduction/` | `simulation-introduction-visualization` | WALS migration | Registered and present |
| `simulation-random-variable` | WALS Simulation | `apps/simulation-random-variable/` | `simulation-random-variable-visualization` | WALS migration | Registered and present |
| `simulation-variance-reduction` | WALS Simulation | `apps/simulation-variance-reduction/` | `simulation-variance-reduction-visualization` | WALS migration | Registered and present |
| `simulation-resampling` | WALS Simulation | `apps/simulation-resampling/` | `simulation-resampling-visualization` | WALS migration | Registered and present |
| `simulation-mcmc` | WALS Simulation | `apps/simulation-mcmc/` | `simulation-mcmc-visualization` | WALS migration | Registered and present |
| `mes-anova` | WALS MES | `apps/mes-anova/` | `mes-anova-visualization` | WALS migration | Registered and present |
| `mes-confidence-interval` | WALS MES | `apps/mes-confidence-interval/` | `mes-confidence-interval-visualization` | WALS migration | Registered and present |
| `mes-distributions` | WALS MES | `apps/mes-distributions/` | `mes-distributions-visualization` | WALS migration | Registered and present |
| `mes-linear-regression` | WALS MES | `apps/mes-linear-regression/` | `mes-linear-regression-visualization` | WALS migration | Registered and present |

## Workspace Script Inventory

| App path | Package name | Build script | Test script |
| --- | --- | --- | --- |
| `apps/confidence-interval` | `confidence-interval-visualization` | yes | yes |
| `apps/type-error` | `type-error-visualization` | yes | yes |
| `apps/regression` | `regression-visualization` | yes | no |
| `apps/simulation-introduction` | `simulation-introduction-visualization` | yes | yes |
| `apps/simulation-random-variable` | `simulation-random-variable-visualization` | yes | yes |
| `apps/simulation-variance-reduction` | `simulation-variance-reduction-visualization` | yes | yes |
| `apps/simulation-resampling` | `simulation-resampling-visualization` | yes | yes |
| `apps/simulation-mcmc` | `simulation-mcmc-visualization` | yes | yes |
| `apps/mes-anova` | `mes-anova-visualization` | yes | yes |
| `apps/mes-confidence-interval` | `mes-confidence-interval-visualization` | yes | yes |
| `apps/mes-distributions` | `mes-distributions-visualization` | yes | yes |
| `apps/mes-linear-regression` | `mes-linear-regression-visualization` | yes | yes |

## Current Verification Coverage

The root platform currently has tests for:

- visualizer registry order and grouping
- build script coverage for every registered visualizer
- descriptive workspace package names for every registered visualizer
- default visualizer selection
- iframe path resolution under the Vite base URL
- regression bootstrap path ordering
- regression teaching visual style markers
- textbook regression dataset publication and bootstrap references

Most WALS app folders include `test/module.test.ts`. The regression app is the
main exception in this inventory: it has a build script but no local app-level
test script in `apps/regression/package.json`.

## Source-of-Truth Decisions Needed

These decisions should be made before archiving or mirroring standalone
repositories:

1. Confirm whether `statistics-visualization-platform/apps/regression`,
   `regression-visualizer`, or the public `code` repository is canonical for the
   regression module.
2. Confirm whether the existing standalone repositories remain active
   development targets or become read-only historical sources after the platform
   app copies are accepted.
3. Confirm whether WALS standalone repositories should mirror the platform app
   folders or whether the platform branch is the only deployed source.
4. Confirm whether standalone repository README files should point to the
   platform app copies as canonical deployed sources.
5. Confirm whether `Stats-Theory-Base` content should be linked from the platform
   or copied into platform docs/content.

## No-Logic-Change Guardrails

The first consolidation pass should only document and reconcile ownership. It
should not:

- change statistical algorithms
- change dataset meaning
- change app controls or interactions
- restyle modules
- rewrite Cycle.js component architecture
- extract shared packages before duplication is proven

Allowed first-pass follow-up work:

- document app ownership
- document app source repository links
- verify app registration and build inclusion
- normalize non-behavioral metadata such as package names after owner approval
- add missing smoke tests that assert existing behavior

## Recommended Next Actions

1. Run root platform verification: `npm test`.
2. Run Pages build verification: `npm run build:pages`.
3. Compare the three regression sources:
   `apps/regression`, `regression-visualizer`, and `code`.
4. Decide the canonical regression source.
5. Only after that decision, update repository README files or archive notes to
   point to the canonical platform location.
