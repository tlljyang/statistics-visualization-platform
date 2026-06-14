import { describe, expect, it } from "vitest";
import {
  DEFAULT_VISUALIZER_ID,
  getDefaultVisualizer,
  getVisualizerById,
  resolveVisualizerPath,
  visualizers
} from "../src/visualizers";

describe("visualizer registry", () => {
  it("registers all teaching visualizers in grouped navigation order", () => {
    expect(visualizers.map((visualizer) => visualizer.id)).toEqual([
      "confidence-interval",
      "type-error",
      "regression",
      "simulation-introduction",
      "simulation-random-variable",
      "simulation-clt",
      "simulation-variance-reduction",
      "simulation-resampling",
      "simulation-mcmc",
      "mes-anova",
      "mes-confidence-interval",
      "mes-distributions",
      "mes-linear-regression"
    ]);
  });

  it("groups the existing and WALS visualizers separately", () => {
    expect(visualizers.map((visualizer) => visualizer.group)).toEqual([
      "Core Visualizers",
      "Core Visualizers",
      "Core Visualizers",
      "WALS Simulation",
      "WALS Simulation",
      "WALS Simulation",
      "WALS Simulation",
      "WALS Simulation",
      "WALS Simulation",
      "WALS MES",
      "WALS MES",
      "WALS MES",
      "WALS MES"
    ]);
  });

  it("selects the confidence interval page as the default", () => {
    expect(DEFAULT_VISUALIZER_ID).toBe("confidence-interval");
    expect(getDefaultVisualizer().id).toBe(DEFAULT_VISUALIZER_ID);
  });

  it("resolves iframe paths under the current Vite base URL", () => {
    expect(
      resolveVisualizerPath("/statistics-visualization-platform/", "apps/type-error/")
    ).toBe("/statistics-visualization-platform/apps/type-error/");
  });

  it("falls back to the default visualizer for unknown ids", () => {
    expect(getVisualizerById("unknown").id).toBe(DEFAULT_VISUALIZER_ID);
  });
});
