import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { getRegressionDataBaseUrl } from "../apps/regression/src/dataBaseUrl";

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

  it("serves regression datasets from the nested app public folder in platform dev", () => {
    expect(
      getRegressionDataBaseUrl("/apps/regression/", "/", true)
    ).toBe("/apps/regression/public/");
  });

  it("keeps the Vite base URL for production and standalone app dev", () => {
    expect(
      getRegressionDataBaseUrl(
        "/statistics-visualization-platform/apps/regression/",
        "/statistics-visualization-platform/apps/regression/",
        false
      )
    ).toBe("/statistics-visualization-platform/apps/regression/");

    expect(getRegressionDataBaseUrl("/", "/", true)).toBe("/");
  });
});
