import { describe, expect, it } from "vitest";
import { createState } from "../apps/mes-anova/src/components/MesAnovaApp/model";

describe("template module language rendering", () => {
  it("localizes template config, controls, and generated output in Chinese mode", () => {
    const state = createState("anova-workbench", undefined, 510, "zh");

    expect(state.copy.parameters).toBe("参数");
    expect(state.config.category).toBe("WALS MES");
    expect(state.activeExample.title).toBe("方差分析工作台");
    expect(state.activeExample.controls[0].label).toBe("数据集");
    expect(state.result.headline).toBe("方差分析摘要");
    expect(state.result.table?.columns).toContain("来源");
  });
});
