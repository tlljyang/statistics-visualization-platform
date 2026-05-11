import { describe, expect, it } from "vitest";
import { moduleConfig } from "../src/components/MesAnovaApp/module-config";
import { createDefaultControls, createState } from "../src/components/MesAnovaApp/model";
import { runExample } from "../src/simulation/engine";

describe("ANOVA", () => {
  it("keeps the migrated WALS source scope in module metadata", () => {
    expect(moduleConfig.sourcePath).toBe("apps/MES/ANOVA");
    expect(moduleConfig.examples.length).toBe(1);
  });

  it("creates default controls for every migrated template", () => {
    for (const example of moduleConfig.examples) {
      const controls = createDefaultControls(example);
      expect(Object.keys(controls)).toEqual(example.controls.map((control) => control.id));
    }
  });

  it("calculates a teaching result for the default template", () => {
    const state = createState();
    expect(state.result.metrics.length).toBeGreaterThan(0);
    expect(state.result.chart.title.length).toBeGreaterThan(0);
  });

  it("calculates each migrated template without throwing", () => {
    for (const example of moduleConfig.examples) {
      const controls = createDefaultControls(example);
      const result = runExample(example, controls, 510, moduleConfig.data);
      expect(result.headline.length).toBeGreaterThan(0);
      expect(result.metrics.length).toBeGreaterThan(0);
    }
  });
});
