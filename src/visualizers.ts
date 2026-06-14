export interface VisualizerLink {
  id: string;
  group: "Core Visualizers" | "WALS Simulation" | "WALS MES";
  label: string;
  shortLabel: string;
  pageTitle: string;
  path: string;
  repositoryUrl: string;
  source: "existing" | "wals";
}

export const DEFAULT_VISUALIZER_ID = "confidence-interval";

export const visualizers: VisualizerLink[] = [
  {
    id: "confidence-interval",
    group: "Core Visualizers",
    label: "置信区间",
    shortLabel: "区间",
    pageTitle: "置信区间可视化",
    path: "apps/confidence-interval/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/confidence-interval-visualization",
    source: "existing"
  },
  {
    id: "type-error",
    group: "Core Visualizers",
    label: "一类/二类错误",
    shortLabel: "错误",
    pageTitle: "一类/二类错误可视化",
    path: "apps/type-error/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/type-error-visualization",
    source: "existing"
  },
  {
    id: "regression",
    group: "Core Visualizers",
    label: "回归分析",
    shortLabel: "回归",
    pageTitle: "回归可视化",
    path: "apps/regression/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/regression-visualizer",
    source: "existing"
  },
  {
    id: "simulation-introduction",
    group: "WALS Simulation",
    label: "模拟导论",
    shortLabel: "导论",
    pageTitle: "Simulation Introduction",
    path: "apps/simulation-introduction/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/simulation-introduction-visualization",
    source: "wals"
  },
  {
    id: "simulation-random-variable",
    group: "WALS Simulation",
    label: "随机变量",
    shortLabel: "随机变量",
    pageTitle: "Random Variable Generation",
    path: "apps/simulation-random-variable/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/simulation-random-variable-visualization",
    source: "wals"
  },
  {
    id: "simulation-clt",
    group: "WALS Simulation",
    label: "中心极限定理",
    shortLabel: "CLT",
    pageTitle: "Central Limit Theorem",
    path: "apps/simulation-clt/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/simulation-clt-visualization",
    source: "wals"
  },
  {
    id: "simulation-variance-reduction",
    group: "WALS Simulation",
    label: "方差缩减",
    shortLabel: "方差缩减",
    pageTitle: "Monte Carlo Variance Reduction",
    path: "apps/simulation-variance-reduction/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/simulation-variance-reduction-visualization",
    source: "wals"
  },
  {
    id: "simulation-resampling",
    group: "WALS Simulation",
    label: "重抽样",
    shortLabel: "重抽样",
    pageTitle: "Resampling Methods",
    path: "apps/simulation-resampling/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/simulation-resampling-visualization",
    source: "wals"
  },
  {
    id: "simulation-mcmc",
    group: "WALS Simulation",
    label: "MCMC",
    shortLabel: "MCMC",
    pageTitle: "Markov Chain Monte Carlo",
    path: "apps/simulation-mcmc/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/simulation-mcmc-visualization",
    source: "wals"
  },
  {
    id: "mes-anova",
    group: "WALS MES",
    label: "方差分析",
    shortLabel: "ANOVA",
    pageTitle: "ANOVA",
    path: "apps/mes-anova/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/mes-anova-visualization",
    source: "wals"
  },
  {
    id: "mes-confidence-interval",
    group: "WALS MES",
    label: "MES 置信区间",
    shortLabel: "MES 区间",
    pageTitle: "MES Confidence Interval",
    path: "apps/mes-confidence-interval/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/mes-confidence-interval-visualization",
    source: "wals"
  },
  {
    id: "mes-distributions",
    group: "WALS MES",
    label: "概率分布",
    shortLabel: "分布",
    pageTitle: "Distributions",
    path: "apps/mes-distributions/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/mes-distributions-visualization",
    source: "wals"
  },
  {
    id: "mes-linear-regression",
    group: "WALS MES",
    label: "MES 线性回归",
    shortLabel: "MES 回归",
    pageTitle: "MES Linear Regression",
    path: "apps/mes-linear-regression/",
    repositoryUrl:
      "https://github.com/Statistics-Learning-Teaching-Platform/mes-linear-regression-visualization",
    source: "wals"
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
