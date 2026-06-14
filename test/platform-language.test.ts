import { describe, expect, it } from "vitest";
import { platformCopy } from "../src/i18n/platform-copy";

describe("platform language copy", () => {
  it("uses Chinese labels for all platform groups in zh mode", () => {
    expect(platformCopy.zh.groups["Core Visualizers"]).toBe("核心可视化");
    expect(platformCopy.zh.groups["WALS Simulation"]).toBe("模拟模块");
    expect(platformCopy.zh.groups["WALS MES"]).toBe("方法模块");
  });
});
