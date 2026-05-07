export interface VisualizerLink {
  id: string;
  label: string;
  shortLabel: string;
  pageTitle: string;
  path: string;
  repositoryUrl: string;
}

export const DEFAULT_VISUALIZER_ID = "confidence-interval";

export const visualizers: VisualizerLink[] = [
  {
    id: "confidence-interval",
    label: "置信区间",
    shortLabel: "区间",
    pageTitle: "置信区间可视化",
    path: "apps/confidence-interval/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/confidence-interval-visualization"
  },
  {
    id: "type-error",
    label: "一类/二类错误",
    shortLabel: "错误",
    pageTitle: "一类/二类错误可视化",
    path: "apps/type-error/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/type-error-visualization"
  },
  {
    id: "regression",
    label: "回归分析",
    shortLabel: "回归",
    pageTitle: "回归可视化",
    path: "apps/regression/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/regression-visualizer"
  }
];

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
