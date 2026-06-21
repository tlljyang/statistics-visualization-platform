/**
 * 统一 i18n 模块 —— 全平台唯一的翻译入口。
 *
 * 新代码请使用:
 *   import { t, useT, LanguageProvider } from "@stats-viz/shared/i18n";
 *
 * 旧代码（WALS apps）仍可使用:
 *   import { localizeText, templateCopy } from "@stats-viz/shared/i18n";
 * 这些 legacy 函数从 ./legacy.ts 重新导出。
 */

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

// ── 重新导出 legacy 模块（WALS apps 向后兼容）──────────────────────
export {
  templateCopy,
  localizeText,
  localizeModuleConfig,
  localizeSimulationResult,
  localizeTableRows,
  hasUnexpectedLatin,
  type TemplateCopy,
} from "./legacy";

// ── 语言类型 ──────────────────────────────────────────────────────
export type Language = "zh" | "en";
export const LANGUAGE_STORAGE_KEY = "statistics-platform-language";

// ── 语言管理（无 postMessage，直接 localStorage + pub/sub）─────────
type LanguageListener = (lang: Language) => void;
const listeners = new Set<LanguageListener>();

export function normalizeLanguage(value: unknown): Language {
  return value === "en" ? "en" : "zh";
}

export function getLanguage(): Language {
  try {
    return normalizeLanguage(
      typeof localStorage !== "undefined"
        ? localStorage.getItem(LANGUAGE_STORAGE_KEY)
        : "zh",
    );
  } catch {
    return "zh";
  }
}

export function setLanguage(lang: Language): void {
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
  } catch {
    // localStorage 可能在嵌入环境中不可用
  }
  listeners.forEach((fn) => fn(lang));
}

export function subscribeLanguage(fn: LanguageListener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

// ── Keyed translations ────────────────────────────────────────────
// 平台 Shell 字符串（原 src/i18n/platform-copy.ts）
const platformCopy = {
  zh: {
    brandTitle: "统计学习工作室",
    brandSubtitle: "统计可视化学习",
    navLabel: "选择可视化模块",
    tipTitle: "探索。模拟。理解。",
    tipBody: "用交互式可视化工具建立统计直觉与推断信心。",
    documentSuffix: "统计学习可视化平台",
    resizeLabel: "调整左侧目录和模块内容宽度",
    groups: {
      "Core Visualizers": "核心可视化",
      "WALS Simulation": "模拟模块",
      "WALS MES": "方法模块",
    },
  },
  en: {
    brandTitle: "Statistics Learning Studio",
    brandSubtitle: "Statistics visualization learning",
    navLabel: "Choose visualization module",
    tipTitle: "Explore. Simulate. Understand.",
    tipBody: "Interactive visual tools to build statistical intuition and confidence.",
    documentSuffix: "Statistics Learning Visualization Platform",
    resizeLabel: "Resize sidebar and module content",
    groups: {
      "Core Visualizers": "Core Visualizers",
      "WALS Simulation": "Simulation",
      "WALS MES": "Methods",
    },
  },
} as const;

// 各 app 的导航标签 [label, pageTitle]
const visualizerLabels: Record<string, Record<Language, [string, string]>> = {
  "confidence-interval": {
    zh: ["置信区间", "置信区间可视化"],
    en: ["Confidence Interval", "Confidence Interval Visualizer"],
  },
  "type-error": {
    zh: ["一类/二类错误", "一类/二类错误可视化"],
    en: ["Type I / II Error", "Type I / II Error Visualizer"],
  },
  regression: {
    zh: ["回归分析", "回归可视化"],
    en: ["Regression", "Regression Visualizer"],
  },
  "simulation-introduction": {
    zh: ["模拟导论", "模拟导论"],
    en: ["Simulation Introduction", "Simulation Introduction"],
  },
  "simulation-random-variable": {
    zh: ["随机变量", "随机变量生成"],
    en: ["Random Variables", "Random Variable Generation"],
  },
  "simulation-clt": {
    zh: ["中心极限定理", "中心极限定理"],
    en: ["Central Limit Theorem", "Central Limit Theorem"],
  },
  "simulation-variance-reduction": {
    zh: ["方差缩减", "蒙特卡洛方差缩减"],
    en: ["Variance Reduction", "Monte Carlo Variance Reduction"],
  },
  "simulation-resampling": {
    zh: ["重抽样", "重抽样方法"],
    en: ["Resampling", "Resampling Methods"],
  },
  "simulation-mcmc": {
    zh: ["MCMC", "马尔可夫链蒙特卡洛"],
    en: ["MCMC", "Markov Chain Monte Carlo"],
  },
  "mes-anova": {
    zh: ["方差分析", "方差分析"],
    en: ["ANOVA", "Analysis of Variance"],
  },
  "mes-confidence-interval": {
    zh: ["MES 置信区间", "MES 置信区间"],
    en: ["MES Confidence Interval", "MES Confidence Interval"],
  },
  "mes-distributions": {
    zh: ["概率分布", "概率分布"],
    en: ["Distributions", "Distributions"],
  },
  "mes-linear-regression": {
    zh: ["MES 线性回归", "MES 线性回归"],
    en: ["MES Linear Regression", "MES Linear Regression"],
  },
};

// ── t() 函数：按 key 路径取翻译 ───────────────────────────────────
type Params = Record<string, string | number>;

function resolvePath(obj: unknown, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in (acc as object)) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function interpolate(template: string, params?: Params): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in params ? String(params[key]) : `{${key}}`,
  );
}

/**
 * 按 dotted key 路径取翻译，例如:
 *   t("platform.brandTitle")
 *   t("platform.groups.Core Visualizers")
 *   t("confidenceInterval.samples", { count: 5 })
 */
export function t(key: string, params?: Params): string {
  const lang = getLanguage();
  const value = resolvePath(allTranslations, `${lang}.${key}`);
  if (typeof value === "string") {
    return interpolate(value, params);
  }
  // 回退到英文
  const fallback = resolvePath(allTranslations, `en.${key}`);
  if (typeof fallback === "string") {
    return interpolate(fallback, params);
  }
  return key;
}

// ── React 集成 ────────────────────────────────────────────────────
const LanguageContext = createContext<Language>(getLanguage());

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>(getLanguage());

  useEffect(() => {
    return subscribeLanguage(setLang);
  }, []);

  return (
    <LanguageContext.Provider value={lang}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): Language {
  return useContext(LanguageContext);
}

/** React hook: 返回当前语言的 t 函数，语言切换时自动重渲染 */
export function useT() {
  const lang = useLanguage();
  return useCallback(
    (key: string, params?: Params) => {
      const value = resolvePath(allTranslations, `${lang}.${key}`);
      if (typeof value === "string") {
        return interpolate(value, params);
      }
      const fallback = resolvePath(allTranslations, `en.${key}`);
      if (typeof fallback === "string") {
        return interpolate(fallback, params);
      }
      return key;
    },
    [lang],
  );
}

// ── 辅助：获取 visualizer 标签 ────────────────────────────────────
export function getVisualizerLabel(id: string, lang?: Language): [string, string] {
  const language = lang ?? getLanguage();
  return visualizerLabels[id]?.[language] ?? [id, id];
}

export function getPlatformCopy(lang?: Language) {
  const language = lang ?? getLanguage();
  return platformCopy[language];
}

// ── Confidence Interval 翻译（原 copy.ts，合并到统一模块）──────────
export const confidenceIntervalCopy = {
  zh: {
    coreVisualizer: "核心可视化",
    title: "置信区间",
    kicker: "通过重复抽样理解不确定性 ✦",
    description:
      "置信区间用样本数据为未知总体参数构造一个估计区间。重复抽样可以帮助我们观察这种方法有多常覆盖真实值。",
    modelOutput: "模型输出",
    chartTitle: "重复抽样中的置信区间",
    chartDescription: "每条水平区间来自一次随机样本。竖直虚线表示真实均值。",
    samples: "样本数：{count}",
    capturesTrueMean: "覆盖真实均值",
    missesTrueMean: "未覆盖真实均值",
    trueMean: "真实均值（μ = {mean}）",
    populationScale: "总体尺度",
    sampleIndex: "样本序号",
    observedCoverage: "观察覆盖率",
    observedCoverageNote: "已生成区间中包含真实均值的比例。",
    samplesDrawn: "已抽样本数",
    samplesDrawnNote: "样本越多，长期覆盖模式越容易观察。",
    averageIntervalWidth: "平均区间宽度",
    averageIntervalWidthNote: "置信水平更高或总体变异更大时，区间通常更宽。",
    zMultiplier: "Z 乘数",
    zMultiplierNote: "构造每个区间时使用的临界值。",
    parameters: "参数",
    generateOne: "生成 1 个样本",
    generateTwenty: "生成 20 个样本",
    reset: "重置",
    controlHint: "用重复抽样比较区间表现和目标置信水平。",
    conceptKeyIdea: "概念 + 核心思想",
    whatIsTitle: "什么是置信区间？",
    whatIsBody: "置信区间是利用样本数据为未知总体参数构造的区间估计。",
    coverageTitle: "覆盖率是长期行为",
    coverageBody:
      "置信水平描述的是这种方法在重复抽样中长期覆盖真实参数的比例，而不是某一个区间包含真实值的概率。",
    formula: "公式",
    estimate: "估计值",
    criticalValue: "临界值",
    se: "标准误",
    formulaNote: "当前临界值：{zValue}。图中显示的总体均值：{populationMean}。",
    howToReadThis: "如何阅读",
    currentInterpretation: "当前解读",
    emptyInterpretation: "先生成一个样本，让学生看到一个区间，再讨论重复抽样。",
    healthyInterpretation: "当前覆盖率达到或超过目标置信水平，长期行为看起来比较稳定。",
    lowCoverageInterpretation: "当前覆盖率低于目标置信水平，适合讨论随机性和有限样本带来的波动。",
    emptyPrompt: "生成样本后开始讨论覆盖率。",
    missPrompt: "当前有 {misses} 个区间没有覆盖真实均值。",
    learningNote: "学习提示",
    learningNoteBody: "尝试调整样本量和总体标准差，观察区间宽度与覆盖率如何变化。",
    controlsTitle: "置信区间参数",
    controlsIntro: "调整模拟输入，再重复生成样本，观察区间捕捉真实均值的频率。",
    sampleSize: "样本量",
    sampleSizeHint: "样本量越大，置信区间通常越窄。",
    populationSD: "总体标准差",
    populationSDHint: "变异越大，区间越宽，小样本下覆盖率也更不稳定。",
    confidenceLevel: "置信水平",
    confidenceLevelHint: "置信水平越高，覆盖真实均值的频率越高，但区间也会更宽。",
    confidenceInfo: "95% 置信水平表示：长期来看，用这种方法构造的区间大约 95% 会包含真实总体均值。",
  },
  en: {
    coreVisualizer: "Core Visualizer",
    title: "Confidence Interval",
    kicker: "Understand uncertainty through repeated sampling ✦",
    description:
      "Confidence intervals quantify uncertainty about a population parameter by constructing an interval from sample data. Repeated sampling shows how often our intervals capture the true value.",
    modelOutput: "Model output",
    chartTitle: "Confidence intervals across repeated samples",
    chartDescription:
      "Each horizontal interval comes from a different random sample. The vertical dashed line marks the true mean.",
    samples: "Samples: {count}",
    capturesTrueMean: "Captures true mean",
    missesTrueMean: "Misses true mean",
    trueMean: "True Mean (μ = {mean})",
    populationScale: "Population scale",
    sampleIndex: "Sample index",
    observedCoverage: "Observed Coverage",
    observedCoverageNote: "Share of generated intervals that contain the true mean.",
    samplesDrawn: "Samples Drawn",
    samplesDrawnNote: "More samples make the long-run pattern easier to see.",
    averageIntervalWidth: "Average Interval Width",
    averageIntervalWidthNote: "Higher confidence or more variability usually widens intervals.",
    zMultiplier: "Z Multiplier",
    zMultiplierNote: "Critical value used to construct each interval.",
    parameters: "Parameters",
    generateOne: "Generate 1 Sample",
    generateTwenty: "Generate 20 Samples",
    reset: "Reset",
    controlHint: "Use repeated samples to compare interval behavior with the target confidence level.",
    conceptKeyIdea: "Concept + key idea",
    whatIsTitle: "What is a Confidence Interval?",
    whatIsBody:
      "A confidence interval is an interval-built estimate for an unknown population parameter from sample data.",
    coverageTitle: "Coverage is Long-Run Behavior",
    coverageBody:
      "The confidence level describes how often this method captures the true parameter across repeated samples, not the probability for any one interval.",
    formula: "Formula",
    estimate: "estimate",
    criticalValue: "critical value",
    se: "SE",
    formulaNote: "Current critical value: {zValue}. Population mean shown in the chart: {populationMean}.",
    howToReadThis: "How to read this",
    currentInterpretation: "Current interpretation",
    emptyInterpretation:
      "Start by generating a sample so students can see one interval before talking about repeated sampling.",
    healthyInterpretation:
      "Coverage is currently at or above the target confidence level, so the long-run behavior is looking healthy.",
    lowCoverageInterpretation:
      "Coverage is currently below the target confidence level, which is a good prompt to discuss randomness and finite samples.",
    emptyPrompt: "Generate samples to start the coverage conversation.",
    missPrompt: "{misses} interval(s) currently miss the true mean.",
    learningNote: "Learning note",
    learningNoteBody:
      "Try changing the sample size and population SD to see how interval width and coverage behave in practice.",
    controlsTitle: "Confidence Interval Controls",
    controlsIntro:
      "Tune the simulation inputs, then generate repeated samples to see how often intervals capture the true mean.",
    sampleSize: "Sample Size",
    sampleSizeHint: "Larger samples usually narrow the confidence interval.",
    populationSD: "Population SD",
    populationSDHint: "Higher variability makes intervals wider and coverage noisier in small samples.",
    confidenceLevel: "Confidence Level",
    confidenceLevelHint: "Higher confidence captures the true mean more often, but also widens the interval.",
    confidenceInfo:
      "A 95% confidence level means that over the long run, about 95% of intervals constructed this way will contain the true population mean.",
  },
} as const;

// ── 合并所有 keyed translations ───────────────────────────────────
const allTranslations = {
  zh: {
    platform: platformCopy.zh,
    confidenceInterval: confidenceIntervalCopy.zh,
  },
  en: {
    platform: platformCopy.en,
    confidenceInterval: confidenceIntervalCopy.en,
  },
};
