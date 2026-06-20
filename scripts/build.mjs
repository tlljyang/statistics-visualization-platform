import { execFile, execFileSync } from "node:child_process";
import { promisify } from "node:util";
import { rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { apps as registry } from "./apps.mjs";

const execFileAsync = promisify(execFile);
const rootDir = dirname(fileURLToPath(import.meta.url));
const projectDir = resolve(rootDir, "..");
const distDir = resolve(projectDir, "dist");
const basePath = process.env.BASE_PATH ?? "/";

// Derive the per-app build list from the single source of truth in apps.mjs
// (the same registry src/visualizers.ts consumes). Adding an app = one record
// there; no need to touch this file.
const apps = registry.map((app) => ({
  name: app.id,
  cwd: resolve(projectDir, app.path.replace(/\/$/, "")),
  baseSegment: app.path
}));

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

// Root shell build runs first (synchronously) since it emits the shared dist/
// assets the per-app builds rely on.
run("npx", ["vite", "build", "--base", basePath]);

// Build all apps in parallel: each writes to its own dist/apps/<name> directory
// (--emptyOutDir=false), so there are no write conflicts between concurrent
// builds. This replaces the previous serial loop and cuts CI wall-clock time.
await Promise.all(
  apps.map(async (app) => {
    console.log(`[build] ${app.name} starting`);
    const args = [
      "run",
      "build",
      "--",
      "--base",
      joinBase(basePath, app.baseSegment),
      "--outDir",
      resolve(distDir, "apps", app.name),
      "--emptyOutDir=false"
    ];
    try {
      const { stdout, stderr } = await execFileAsync("npm", args, {
        cwd: app.cwd,
        env: process.env
      });
      if (stdout) process.stdout.write(`[${app.name}] ${stdout}`);
      if (stderr) process.stderr.write(`[${app.name}] ${stderr}`);
      console.log(`[build] ${app.name} done`);
    } catch (error) {
      console.error(`[build] ${app.name} failed`);
      if (error.stdout) process.stderr.write(error.stdout.toString());
      if (error.stderr) process.stderr.write(error.stderr.toString());
      throw error;
    }
  })
);
