import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(rootDir, "..");
const distDir = resolve(projectDir, "dist");
const basePath = process.env.BASE_PATH ?? "/";

const apps = [
  {
    name: "confidence-interval",
    cwd: resolve(projectDir, "apps/confidence-interval"),
    baseSegment: "apps/confidence-interval/"
  },
  {
    name: "type-error",
    cwd: resolve(projectDir, "apps/type-error"),
    baseSegment: "apps/type-error/"
  },
  {
    name: "regression",
    cwd: resolve(projectDir, "apps/regression"),
    baseSegment: "apps/regression/"
  },
  {
    name: "simulation-introduction",
    cwd: resolve(projectDir, "apps/simulation-introduction"),
    baseSegment: "apps/simulation-introduction/"
  },
  {
    name: "simulation-random-variable",
    cwd: resolve(projectDir, "apps/simulation-random-variable"),
    baseSegment: "apps/simulation-random-variable/"
  },
  {
    name: "simulation-variance-reduction",
    cwd: resolve(projectDir, "apps/simulation-variance-reduction"),
    baseSegment: "apps/simulation-variance-reduction/"
  },
  {
    name: "simulation-resampling",
    cwd: resolve(projectDir, "apps/simulation-resampling"),
    baseSegment: "apps/simulation-resampling/"
  },
  {
    name: "simulation-mcmc",
    cwd: resolve(projectDir, "apps/simulation-mcmc"),
    baseSegment: "apps/simulation-mcmc/"
  },
  {
    name: "mes-anova",
    cwd: resolve(projectDir, "apps/mes-anova"),
    baseSegment: "apps/mes-anova/"
  },
  {
    name: "mes-confidence-interval",
    cwd: resolve(projectDir, "apps/mes-confidence-interval"),
    baseSegment: "apps/mes-confidence-interval/"
  },
  {
    name: "mes-distributions",
    cwd: resolve(projectDir, "apps/mes-distributions"),
    baseSegment: "apps/mes-distributions/"
  },
  {
    name: "mes-linear-regression",
    cwd: resolve(projectDir, "apps/mes-linear-regression"),
    baseSegment: "apps/mes-linear-regression/"
  }
];

function joinBase(base, segment) {
  const normalizedBase = base.endsWith("/") ? base : `${base}/`;
  return `${normalizedBase}${segment}`;
}

function run(command, args, cwd = projectDir) {
  execFileSync(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env
  });
}

rmSync(distDir, { force: true, recursive: true });

run("npx", ["vite", "build", "--base", basePath]);

for (const app of apps) {
  run(
    "npm",
    [
      "run",
      "build",
      "--",
      "--base",
      joinBase(basePath, app.baseSegment),
      "--outDir",
      resolve(distDir, "apps", app.name),
      "--emptyOutDir=false"
    ],
    app.cwd
  );
}
