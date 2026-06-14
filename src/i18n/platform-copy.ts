import type { VisualizerLink } from "../visualizers";

export const PLATFORM_LANGUAGE_KEY = "statistics-platform-language";
export type PlatformLanguage = "zh" | "en";

export const platformCopy = {
  zh: {
    brandTitle: "统计学习工作室",
    brandSubtitle: "统计可视化学习",
    navLabel: "选择可视化模块",
    tipTitle: "探索。模拟。理解。",
    tipBody: "用交互式可视化工具建立统计直觉与推断信心。",
    documentSuffix: "统计学习可视化平台",
    groups: {
      "Core Visualizers": "核心可视化",
      "WALS Simulation": "模拟模块",
      "WALS MES": "方法模块"
    },
    visualizers: {
      "confidence-interval": ["置信区间", "置信区间可视化"],
      "type-error": ["一类/二类错误", "一类/二类错误可视化"],
      regression: ["回归分析", "回归可视化"],
      "simulation-introduction": ["模拟导论", "模拟导论"],
      "simulation-random-variable": ["随机变量", "随机变量生成"],
      "simulation-clt": ["中心极限定理", "中心极限定理"],
      "simulation-variance-reduction": ["方差缩减", "蒙特卡洛方差缩减"],
      "simulation-resampling": ["重抽样", "重抽样方法"],
      "simulation-mcmc": ["MCMC", "马尔可夫链蒙特卡洛"],
      "mes-anova": ["方差分析", "方差分析"],
      "mes-confidence-interval": ["MES 置信区间", "MES 置信区间"],
      "mes-distributions": ["概率分布", "概率分布"],
      "mes-linear-regression": ["MES 线性回归", "MES 线性回归"]
    }
  },
  en: {
    brandTitle: "Statistics Learning Studio",
    brandSubtitle: "Statistics visualization learning",
    navLabel: "Choose visualization module",
    tipTitle: "Explore. Simulate. Understand.",
    tipBody: "Interactive visual tools to build statistical intuition and confidence.",
    documentSuffix: "Statistics Learning Visualization Platform",
    groups: {
      "Core Visualizers": "Core Visualizers",
      "WALS Simulation": "Simulation",
      "WALS MES": "Methods"
    },
    visualizers: {
      "confidence-interval": ["Confidence Interval", "Confidence Interval Visualizer"],
      "type-error": ["Type I / II Error", "Type I / II Error Visualizer"],
      regression: ["Regression", "Regression Visualizer"],
      "simulation-introduction": ["Simulation Introduction", "Simulation Introduction"],
      "simulation-random-variable": ["Random Variables", "Random Variable Generation"],
      "simulation-clt": ["Central Limit Theorem", "Central Limit Theorem"],
      "simulation-variance-reduction": ["Variance Reduction", "Monte Carlo Variance Reduction"],
      "simulation-resampling": ["Resampling", "Resampling Methods"],
      "simulation-mcmc": ["MCMC", "Markov Chain Monte Carlo"],
      "mes-anova": ["ANOVA", "Analysis of Variance"],
      "mes-confidence-interval": ["MES Confidence Interval", "MES Confidence Interval"],
      "mes-distributions": ["Distributions", "Distributions"],
      "mes-linear-regression": ["MES Linear Regression", "MES Linear Regression"]
    }
  }
} satisfies Record<
  PlatformLanguage,
  {
    brandTitle: string;
    brandSubtitle: string;
    navLabel: string;
    tipTitle: string;
    tipBody: string;
    documentSuffix: string;
    groups: Record<VisualizerLink["group"], string>;
    visualizers: Record<string, [string, string]>;
  }
>;
