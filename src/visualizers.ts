// The app registry lives in scripts/apps.mjs so that scripts/build.mjs and
// this file share ONE source of truth (adding an app = one record there).
import { apps, type AppRecord } from "../scripts/apps.mjs";

export type VisualizerLink = AppRecord;

export const DEFAULT_VISUALIZER_ID = "confidence-interval";

export const visualizers: VisualizerLink[] = apps;

export function getDefaultVisualizer(): VisualizerLink {
  const defaultVisualizer = visualizers.find(
    (visualizer) => visualizer.id === DEFAULT_VISUALIZER_ID
  );

  if (!defaultVisualizer) {
    throw new Error("Default visualizer is not registered.");
  }

  return defaultVisualizer;
}

export function getVisualizerById(id: string | null): VisualizerLink {
  return (
    visualizers.find((visualizer) => visualizer.id === id) ??
    getDefaultVisualizer()
  );
}

export function resolveVisualizerPath(baseUrl: string, path: string): string {
  const normalizedBaseUrl = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

  return `${normalizedBaseUrl}${normalizedPath}`;
}
