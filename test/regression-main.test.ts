import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

describe("regression app bootstrap", () => {
  it("initializes the data base URL before building sidebar dataset paths", () => {
    const mainSource = readFileSync(
      resolve(process.cwd(), "apps/regression/src/main.ts"),
      "utf8"
    );

    const dataBaseUrlDeclaration = mainSource.indexOf("const dataBaseUrl");
    const sidebarPropsDeclaration = mainSource.indexOf("const sidebarProps$");

    expect(dataBaseUrlDeclaration).toBeGreaterThanOrEqual(0);
    expect(dataBaseUrlDeclaration).toBeLessThan(sidebarPropsDeclaration);
  });
});
