import { describe, expect, it } from "vitest";
import {
  DEFAULT_VISUALIZER_ID,
  getDefaultVisualizer,
  getVisualizerById,
  resolveVisualizerPath,
  visualizers
} from "../src/visualizers";

describe("visualizer registry", () => {
  it("registers the three teaching visualizers in navigation order", () => {
    expect(visualizers.map((visualizer) => visualizer.id)).toEqual([
      "confidence-interval",
      "type-error",
      "regression"
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
