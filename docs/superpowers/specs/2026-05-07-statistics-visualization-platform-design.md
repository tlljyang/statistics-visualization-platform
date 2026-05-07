# Statistics Visualization Platform Design

## Goal

Merge the three existing teaching visualizers into one static GitHub Pages site without changing the source repositories.

## Architecture

The new repository is a Vite static site with a small shell page and three embedded visualizer pages. The shell owns navigation, page title, and iframe sizing. Each visualizer remains an independent Vite/Cycle.js app under `apps/`, which keeps each app's DOM driver, state driver, dependencies, and chart behavior isolated.

## Pages

- `apps/confidence-interval/`: copied from `confidence-interval-visualization`
- `apps/type-error/`: copied from `type-error-visualization`
- `apps/regression/`: copied from `regression-visualizer`

## Deployment

GitHub Actions runs `npm ci` and `npm run build:pages`, uploads `dist/`, and deploys through GitHub Pages. The build uses `/statistics-visualization-platform/` as the Pages base path.

## Verification

The shell has unit tests for the visualizer registry and path resolution. The full verification path is `npm test`, `npm run build:pages`, and a local preview smoke check.
