// Type declarations for scripts/apps.mjs so TypeScript consumers
// (src/visualizers.ts) get full types without enabling allowJs.
export type AppGroup = "Core Visualizers" | "WALS Simulation" | "WALS MES";
export type AppSource = "existing" | "wals";

export interface AppRecord {
  id: string;
  group: AppGroup;
  label: string;
  shortLabel: string;
  pageTitle: string;
  path: string;
  repositoryUrl: string;
  source: AppSource;
}

export const apps: AppRecord[];
