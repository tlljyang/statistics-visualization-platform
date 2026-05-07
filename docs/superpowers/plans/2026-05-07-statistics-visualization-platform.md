# Statistics Visualization Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build and deploy one GitHub Pages site containing the confidence interval, type error, and regression visualizers.

**Architecture:** Create a Vite shell with tested visualizer registry helpers, copy the three existing apps into `apps/`, and build each app into `dist/apps/<id>/`. The shell displays the active visualizer in an iframe so each Cycle.js runtime stays isolated.

**Tech Stack:** Vite, TypeScript, Vitest, Cycle.js, D3, GitHub Actions, GitHub Pages.

---

### Task 1: Shell Registry

**Files:**
- Create: `src/visualizers.ts`
- Create: `src/main.ts`
- Create: `src/styles.css`
- Test: `test/visualizers.test.ts`

- [x] **Step 1: Write registry tests**

Run: `npm test`
Expected: FAIL because `src/visualizers.ts` does not exist yet.

- [ ] **Step 2: Implement registry and shell**

Create `src/visualizers.ts` with three visualizer entries, path resolution, default selection, and id lookup. Create `src/main.ts` to render navigation and an iframe. Create `src/styles.css` for the shell layout.

- [ ] **Step 3: Run registry tests**

Run: `npm test`
Expected: PASS.

### Task 2: Copy Visualizer Apps

**Files:**
- Create: `apps/confidence-interval/`
- Create: `apps/type-error/`
- Create: `apps/regression/`

- [ ] **Step 1: Copy source projects**

Use `rsync` from the three local repositories, excluding `.git`, `node_modules`, `dist`, and generated test output.

- [ ] **Step 2: Patch regression data paths**

Change the copied regression app dataset paths from absolute `/data/...` URLs to `${import.meta.env.BASE_URL}data/...` so they work under GitHub Pages.

### Task 3: Build and Deploy

**Files:**
- Create: `scripts/build.mjs`
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: Build all apps into one dist**

Run: `npm run build:pages`
Expected: shell files under `dist/` and visualizers under `dist/apps/`.

- [ ] **Step 2: Publish**

Create `Statistics-Learning-Teaching-Platform/statistics-visualization-platform`, push `main`, and enable GitHub Pages through the deployment workflow.
