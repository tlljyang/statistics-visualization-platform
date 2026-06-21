import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { visualizers } from "../src/visualizers";

describe("platform integration inventory", () => {
  it("builds every registered visualizer app", () => {
    // The SPA shell imports all apps via dynamic imports in appRegistry.tsx,
    // so Vite automatically code-splits each app. The single source of truth
    // for the app registry lives in scripts/apps.mjs, consumed by both
    // src/visualizers.ts and src/shell/appRegistry.tsx.
    const registrySource = readFileSync(
      resolve(process.cwd(), "scripts/apps.mjs"),
      "utf8"
    );
    for (const visualizer of visualizers) {
      expect(registrySource).toContain(`id: "${visualizer.id}"`);
      expect(registrySource).toContain(`path: "${visualizer.path}"`);
    }

    // appRegistry.tsx must derive every app from the single source of truth
    // (apps.mjs) via dynamic glob discovery, so each app is bundled.
    const appRegistrySource = readFileSync(
      resolve(process.cwd(), "src/shell/appRegistry.tsx"),
      "utf8"
    );
    expect(appRegistrySource).toContain("apps.mjs");
    expect(appRegistrySource).toContain("import.meta.glob");
    expect(appRegistrySource).toContain("apps/*/src/main.tsx");
    expect(appRegistrySource).toContain("apps/*/src/main.ts");
    expect(appRegistrySource).toContain("app.id");
  });

  it("uses descriptive workspace package names for canonical apps", () => {
    const expectedNames: Record<string, string> = {
      "confidence-interval": "confidence-interval-visualization",
      "type-error": "type-error-visualization",
      regression: "regression-visualization",
      "simulation-introduction": "simulation-introduction-visualization",
      "simulation-random-variable": "simulation-random-variable-visualization",
      "simulation-clt": "simulation-clt-visualization",
      "simulation-variance-reduction":
        "simulation-variance-reduction-visualization",
      "simulation-resampling": "simulation-resampling-visualization",
      "simulation-mcmc": "simulation-mcmc-visualization",
      "mes-anova": "mes-anova-visualization",
      "mes-confidence-interval": "mes-confidence-interval-visualization",
      "mes-distributions": "mes-distributions-visualization",
      "mes-linear-regression": "mes-linear-regression-visualization"
    };

    for (const visualizer of visualizers) {
      const packageJson = JSON.parse(
        readFileSync(
          resolve(process.cwd(), visualizer.path, "package.json"),
          "utf8"
        )
      ) as { name?: string };

      expect(packageJson.name).toBe(expectedNames[visualizer.id]);
    }
  });

  it("uses app-relative script entries so iframe dev paths load app code", () => {
    for (const visualizer of visualizers) {
      const indexHtml = readFileSync(
        resolve(process.cwd(), visualizer.path, "index.html"),
        "utf8"
      );

      // Apps may use either main.ts (Cycle.js) or main.tsx (React).
      const hasRelativeTs = indexHtml.includes('src="./src/main.ts"');
      const hasRelativeTsx = indexHtml.includes('src="./src/main.tsx"');
      expect(hasRelativeTs || hasRelativeTsx).toBe(true);
      expect(indexHtml).not.toContain('src="/src/main.ts"');
      expect(indexHtml).not.toContain('src="/src/main.tsx"');
    }
  });

  it("does not rely on app-local import aliases in iframe-loaded source files", () => {
    const sourceFiles = listSourceFiles(resolve(process.cwd(), "apps"));

    for (const filePath of sourceFiles) {
      const source = readFileSync(filePath, "utf8");

      expect(source).not.toMatch(/from ["']@(components|utils)\//);
    }
  });

  it("keeps the platform module picker in the left sidebar", () => {
    const sidebarSource = readFileSync(
      resolve(process.cwd(), "src/shell/Sidebar.tsx"),
      "utf8"
    );
    const styles = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");

    expect(sidebarSource).toContain("platform-sidebar");
    expect(sidebarSource).toContain("platform-sidebar__mark");
    expect(sidebarSource).toContain("platform-sidebar__tip");
    expect(sidebarSource).toContain("visualizer-nav__label");
    expect(sidebarSource).not.toContain("platform-header");
    expect(styles).toContain("--bg: #f8f3ea");
    expect(styles).toContain("--sage: #6f8f7a");
    expect(styles).toContain("grid-template-columns: 310px minmax(0, 1fr)");
    expect(styles).toContain("height: 100vh");
    expect(styles).toContain("overflow: hidden");
    expect(styles).toContain("overflow-y: auto");
    expect(styles).toContain("overscroll-behavior: contain");
    expect(styles).toContain("border-radius: 24px");
    expect(styles).toContain("box-shadow: var(--shadow-soft)");
    expect(styles).not.toContain(".platform-header");
  });

  it("keeps WALS modules on the shared experiment-and-teaching layout", () => {
    const walsVisualizers = visualizers.filter(
      (visualizer) => visualizer.source === "wals"
    );

    // WALS apps share a single React template (WalsApp.tsx) that owns the
    // experiment-and-teaching layout. Each app only contributes a
    // module-config.ts and a custom.css. Design tokens (--bg, --sage, etc.)
    // are centralized in the shared tokens.css.
    const walsAppSource = readFileSync(
      resolve(process.cwd(), "apps/shared/wals/WalsApp.tsx"),
      "utf8"
    );
    const tokensCss = readFileSync(
      resolve(process.cwd(), "apps/shared/styles/tokens.css"),
      "utf8"
    );

    expect(walsAppSource).toContain("experiment-board");
    expect(walsAppSource).toContain("output-dock");
    expect(walsAppSource).toContain("teaching-area");
    expect(walsAppSource).toContain("parameter-panel");

    expect(tokensCss).toContain("--bg: #f8f3ea");
    expect(tokensCss).toContain("--sage: #6f8f7a");

    for (const visualizer of walsVisualizers) {
      const css = readFileSync(
        resolve(process.cwd(), visualizer.path, "src/styles/custom.css"),
        "utf8"
      );

      expect(css).toContain(".module-layout");
      expect(css).toContain(".experiment-board");
      expect(css).toContain(".output-dock");
      expect(css).toContain(".teaching-area");
      expect(css).toContain(".parameter-panel");
      expect(css).toContain("height: 100vh");
      expect(css).toContain("overflow-y: auto");
      expect(css).toContain("overscroll-behavior: contain");
      expect(css).not.toContain(".studio-topbar");
    }
  });
});

function listSourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const entryPath = resolve(dir, entry);
    const stats = statSync(entryPath);

    if (stats.isDirectory()) {
      return listSourceFiles(entryPath);
    }

    return /\.(ts|tsx)$/.test(entryPath) ? [entryPath] : [];
  });
}
