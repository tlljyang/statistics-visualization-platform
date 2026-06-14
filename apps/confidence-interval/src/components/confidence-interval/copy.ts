import type { Language } from "../../../../shared/language";

export interface ConfidenceIntervalCopy {
  coreVisualizer: string;
  title: string;
  kicker: string;
  description: string;
  modelOutput: string;
  chartTitle: string;
  chartDescription: string;
  samples: (count: number) => string;
  capturesTrueMean: string;
  missesTrueMean: string;
  trueMean: (mean: number) => string;
  populationScale: string;
  sampleIndex: string;
  observedCoverage: string;
  observedCoverageNote: string;
  samplesDrawn: string;
  samplesDrawnNote: string;
  averageIntervalWidth: string;
  averageIntervalWidthNote: string;
  zMultiplier: string;
  zMultiplierNote: string;
  parameters: string;
  generateOne: string;
  generateTwenty: string;
  reset: string;
  controlHint: string;
  conceptKeyIdea: string;
  whatIsTitle: string;
  whatIsBody: string;
  coverageTitle: string;
  coverageBody: string;
  formula: string;
  estimate: string;
  criticalValue: string;
  se: string;
  formulaNote: (zValue: string, populationMean: string) => string;
  howToReadThis: string;
  currentInterpretation: string;
  emptyInterpretation: string;
  healthyInterpretation: string;
  lowCoverageInterpretation: string;
  emptyPrompt: string;
  missPrompt: (misses: number) => string;
  learningNote: string;
  learningNoteBody: string;
  controlsTitle: string;
  controlsIntro: string;
  sampleSize: string;
  sampleSizeHint: string;
  populationSD: string;
  populationSDHint: string;
  confidenceLevel: string;
  confidenceLevelHint: string;
  confidenceInfo: string;
}

export const confidenceCopy: Record<Language, ConfidenceIntervalCopy> = {
  zh: {
    coreVisualizer: "核心可视化",
    title: "置信区间",
    kicker: "通过重复抽样理解不确定性 ✦",
    description:
      "置信区间用样本数据为未知总体参数构造一个估计区间。重复抽样可以帮助我们观察这种方法有多常覆盖真实值。",
    modelOutput: "模型输出",
    chartTitle: "重复抽样中的置信区间",
    chartDescription: "每条水平区间来自一次随机样本。竖直虚线表示真实均值。",
    samples: (count) => `样本数：${count}`,
    capturesTrueMean: "覆盖真实均值",
    missesTrueMean: "未覆盖真实均值",
    trueMean: (mean) => `真实均值（μ = ${mean}）`,
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
    formulaNote: (zValue, populationMean) =>
      `当前临界值：${zValue}。图中显示的总体均值：${populationMean}。`,
    howToReadThis: "如何阅读",
    currentInterpretation: "当前解读",
    emptyInterpretation: "先生成一个样本，让学生看到一个区间，再讨论重复抽样。",
    healthyInterpretation: "当前覆盖率达到或超过目标置信水平，长期行为看起来比较稳定。",
    lowCoverageInterpretation: "当前覆盖率低于目标置信水平，适合讨论随机性和有限样本带来的波动。",
    emptyPrompt: "生成样本后开始讨论覆盖率。",
    missPrompt: (misses) => `当前有 ${misses} 个区间没有覆盖真实均值。`,
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
    confidenceInfo: "95% 置信水平表示：长期来看，用这种方法构造的区间大约 95% 会包含真实总体均值。"
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
    samples: (count) => `Samples: ${count}`,
    capturesTrueMean: "Captures true mean",
    missesTrueMean: "Misses true mean",
    trueMean: (mean) => `True Mean (μ = ${mean})`,
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
    formulaNote: (zValue, populationMean) =>
      `Current critical value: ${zValue}. Population mean shown in the chart: ${populationMean}.`,
    howToReadThis: "How to read this",
    currentInterpretation: "Current interpretation",
    emptyInterpretation:
      "Start by generating a sample so students can see one interval before talking about repeated sampling.",
    healthyInterpretation:
      "Coverage is currently at or above the target confidence level, so the long-run behavior is looking healthy.",
    lowCoverageInterpretation:
      "Coverage is currently below the target confidence level, which is a good prompt to discuss randomness and finite samples.",
    emptyPrompt: "Generate samples to start the coverage conversation.",
    missPrompt: (misses) =>
      `${misses} interval${misses === 1 ? "" : "s"} currently miss the true mean.`,
    learningNote: "Learning note",
    learningNoteBody:
      "Try changing the sample size and population SD to see how interval width and coverage behave in practice.",
    controlsTitle: "Confidence Interval Controls",
    controlsIntro:
      "Tune the simulation inputs, then generate repeated samples to see how often intervals capture the true mean.",
    sampleSize: "Sample Size",
    sampleSizeHint: "Larger samples usually narrow the confidence interval.",
    populationSD: "Population SD",
    populationSDHint:
      "Higher variability makes intervals wider and coverage noisier in small samples.",
    confidenceLevel: "Confidence Level",
    confidenceLevelHint:
      "Higher confidence captures the true mean more often, but also widens the interval.",
    confidenceInfo:
      "A 95% confidence level means that over the long run, about 95% of intervals constructed this way will contain the true population mean."
  }
};
