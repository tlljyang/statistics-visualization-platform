import { readdirSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { visualizers } from "../src/visualizers";

describe("platform integration inventory", () => {
  it("builds every registered visualizer app", () => {
    const buildScript = readFileSync(
      resolve(process.cwd(), "scripts/build.mjs"),
      "utf8"
    );

    for (const visualizer of visualizers) {
      expect(buildScript).toContain(`name: "${visualizer.id}"`);
      expect(buildScript).toContain(`baseSegment: "${visualizer.path}"`);
    }
  });

  it("uses descriptive workspace package names for canonical apps", () => {
    const expectedNames: Record<string, string> = {
      "confidence-interval": "confidence-interval-visualization",
      "type-error": "type-error-visualization",
      regression: "regression-visualization",
      "simulation-introduction": "simulation-introduction-visualization",
      "simulation-random-variable": "simulation-random-variable-visualization",
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

      expect(indexHtml).toContain('src="./src/main.ts"');
      expect(indexHtml).not.toContain('src="/src/main.ts"');
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
    const mainSource = readFileSync(resolve(process.cwd(), "src/main.ts"), "utf8");
    const styles = readFileSync(resolve(process.cwd(), "src/styles.css"), "utf8");

    expect(mainSource).toContain("platform-sidebar");
    expect(mainSource).toContain("platform-sidebar__mark");
    expect(mainSource).toContain("platform-sidebar__tip");
    expect(mainSource).toContain("visualizer-nav__label");
    expect(mainSource).not.toContain("platform-header");
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

    for (const visualizer of walsVisualizers) {
      const viewFiles = listSourceFiles(resolve(process.cwd(), visualizer.path, "src/components"))
        .filter((filePath) => filePath.endsWith("/view.ts"));
      const viewSource = viewFiles.map((filePath) => readFileSync(filePath, "utf8")).join("\n");
      const css = readFileSync(
        resolve(process.cwd(), visualizer.path, "src/styles/custom.css"),
        "utf8"
      );

      expect(viewSource).toContain(".experiment-board");
      expect(viewSource).toContain(".output-dock");
      expect(viewSource).toContain(".teaching-area");
      expect(viewSource).toContain(".parameter-panel");
      expect(viewSource).not.toContain("renderModuleGroup");
      expect(css).toContain(".module-layout");
      expect(css).toContain(".experiment-board");
      expect(css).toContain(".output-dock");
      expect(css).toContain(".teaching-area");
      expect(css).toContain(".parameter-panel");
      expect(css).toContain("--bg: #f8f3ea");
      expect(css).toContain("--sage: #6f8f7a");
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
