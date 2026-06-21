import { describe, expect, it } from "vitest";
import { moduleConfig } from "../src/module-config";
import { createState } from "@stats-viz/shared/wals/WalsApp";
import { runExample } from "@stats-viz/shared/wals/engine";

describe("MC Integration and Variance Reduction", () => {
  it("keeps the migrated WALS source scope in module metadata", () => {
    expect(moduleConfig.sourcePath).toBe("apps/Simulation/VarianceReduction");
    expect(moduleConfig.examples.length).toBe(9);
  });

  it("creates a teaching result for the default template", () => {
    const state = createState(moduleConfig, undefined, undefined, 510, "zh");
    expect(state.result.metrics.length).toBeGreaterThan(0);
    expect(state.result.chart.title.length).toBeGreaterThan(0);
  });

  it("calculates each migrated template without throwing", () => {
    for (const example of moduleConfig.examples) {
      const controls = Object.fromEntries(
        example.controls.map((control) => [control.id, control.defaultValue]),
      );
      const result = runExample(example, controls, 510, moduleConfig.data);
      expect(result.headline.length).toBeGreaterThan(0);
      expect(result.metrics.length).toBeGreaterThan(0);
    }
  });
});
