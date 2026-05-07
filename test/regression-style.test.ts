import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("regression visual style", () => {
  it("uses the shared blue teaching-page surface language", () => {
    const css = readFileSync(
      resolve(process.cwd(), "apps/regression/src/styles/custom.css"),
      "utf8"
    );

    expect(css).toContain("linear-gradient(135deg, #103c64");
    expect(css).toContain(".page-container");
    expect(css).toContain(".content-grid");
    expect(css).toContain(".control-panel");
    expect(css).toContain(".chart-card");
  });
});
