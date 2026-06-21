import { useMemo, useState } from "react";
import * as d3 from "d3";
import jStat from "jstat";
import { localizeText, useLanguage } from "@stats-viz/shared/i18n";

type TestType = "left-tailed" | "right-tailed" | "two-tailed";

interface Params {
  alpha: number;
  nullMean: number;
  trueMean: number;
  stdDev: number;
}

interface DistributionPoint {
  x: number;
  y: number;
}

const MARGIN = { top: 50, right: 30, bottom: 50, left: 50 };
const WIDTH = 760;
const HEIGHT = 380;

function normalPDF(x: number, mean: number, stdDev: number): number {
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / stdDev) ** 2);
}

function normalCDF(x: number, mean: number, stdDev: number): number {
  return jStat.normal.cdf(x, mean, stdDev);
}

function generateDistribution(mean: number, stdDev: number): DistributionPoint[] {
  return d3.range(-5, 10, 0.05).map((x) => ({ x, y: normalPDF(x, mean, stdDev) }));
}

function createScales() {
  const chartWidth = WIDTH - MARGIN.left - MARGIN.right;
  const chartHeight = HEIGHT - MARGIN.top - MARGIN.bottom;
  return {
    xScale: d3.scaleLinear().domain([-5, 10]).range([0, chartWidth]),
    yScale: d3.scaleLinear().domain([0, 0.5]).range([chartHeight, 0]),
  };
}

function computeCriticalValues(
  alpha: number,
  nullMean: number,
  stdDev: number,
  testType: TestType,
): number[] {
  const pValues =
    testType === "right-tailed"
      ? [1 - alpha]
      : testType === "left-tailed"
        ? [alpha]
        : [alpha / 2, 1 - alpha / 2];
  return pValues.map((p) => jStat.normal.inv(p, nullMean, stdDev));
}

function criticalAreaFn(
  testType: TestType,
): (d: DistributionPoint, c: number[]) => boolean {
  return (d, c) => {
    if (testType === "right-tailed") return d.x > (c[0] ?? 0);
    if (testType === "left-tailed") return d.x < (c[0] ?? 0);
    return d.x < (c[0] ?? 0) || d.x > (c[1] ?? 0);
  };
}

function createHypothesisText(nullMean: number, testType: TestType) {
  const H0Text = `H₀: μ = ${nullMean}`;
  const H1Text =
    testType === "right-tailed"
      ? `Hₐ: μ > ${nullMean}`
      : testType === "left-tailed"
        ? `Hₐ: μ < ${nullMean}`
        : `Hₐ: μ ≠ ${nullMean}`;
  return { H0Text, H1Text };
}

function computeTypeTwoErrorRate(
  criticalValue: number[],
  trueMean: number,
  stdDev: number,
  testType: TestType,
): number {
  if (testType === "right-tailed") return normalCDF(criticalValue[0] ?? 0, trueMean, stdDev);
  if (testType === "left-tailed") return 1 - normalCDF(criticalValue[0] ?? 0, trueMean, stdDev);
  const left = criticalValue[0] ?? 0;
  const right = criticalValue[1] ?? 0;
  return normalCDF(right, trueMean, stdDev) - normalCDF(left, trueMean, stdDev);
}

function buildAreaPath(
  data: DistributionPoint[],
  criticalValue: number[],
  filterFn: (d: DistributionPoint, c: number[]) => boolean,
  scales: ReturnType<typeof createScales>,
  invert: boolean,
): string {
  const area = data.map((d) => ({
    x: d.x,
    y: invert ? (filterFn(d, criticalValue) ? 0 : d.y) : filterFn(d, criticalValue) ? d.y : 0,
  }));
  if (area.length === 0) return "";
  area.push({ x: area[0]!.x, y: 0 });
  const last = area.at(-1)!;
  area.unshift({ x: last.x, y: 0 });
  area.unshift({ x: area[0]!.x, y: 0 });
  const line = d3
    .line<DistributionPoint>()
    .x((d) => scales.xScale(d.x))
    .y((d) => scales.yScale(d.y));
  return line(area) ?? "";
}

export default function TypeErrorApp() {
  const language = useLanguage();
  const t = (text: string) => localizeText(text, language);
  const [testType, setTestType] = useState<TestType>("right-tailed");
  const [params, setParams] = useState<Params>({
    alpha: 0.05,
    nullMean: 0,
    trueMean: 1,
    stdDev: 1,
  });

  const computed = useMemo(() => {
    const scales = createScales();
    const nullDistribution = generateDistribution(params.nullMean, params.stdDev);
    const trueDistribution = generateDistribution(params.trueMean, params.stdDev);
    const cv = computeCriticalValues(params.alpha, params.nullMean, params.stdDev, testType);
    const filterFn = criticalAreaFn(testType);
    const typeTwoErrorRate = computeTypeTwoErrorRate(cv, params.trueMean, params.stdDev, testType);
    return {
      scales,
      nullDistribution,
      trueDistribution,
      criticalValue: cv,
      criticalAreaFn: filterFn,
      hypothesisText: createHypothesisText(params.nullMean, testType),
      typeOneErrorRate: params.alpha,
      typeTwoErrorRate,
      power: 1 - typeTwoErrorRate,
      effectSize: params.trueMean - params.nullMean,
    };
  }, [params, testType]);

  const { scales, nullDistribution, trueDistribution, criticalValue } = computed;
  const plotWidth = WIDTH - MARGIN.left - MARGIN.right;
  const plotHeight = HEIGHT - MARGIN.top - MARGIN.bottom;

  const nullLine = d3
    .line<DistributionPoint>()
    .x((d) => scales.xScale(d.x))
    .y((d) => scales.yScale(d.y));
  const nullPath = nullLine(nullDistribution) ?? "";
  const truePath = nullLine(trueDistribution) ?? "";
  const type1AreaPath = buildAreaPath(
    nullDistribution,
    criticalValue,
    computed.criticalAreaFn,
    scales,
    false,
  );
  const type2AreaPath = buildAreaPath(
    trueDistribution,
    criticalValue,
    computed.criticalAreaFn,
    scales,
    true,
  );

  const legendRows = [
    { kind: "line", className: "chart-inline-legend__line--null", label: t("Null distribution") },
    { kind: "line", className: "chart-inline-legend__line--true", label: t("True distribution") },
    { kind: "dash", className: "chart-inline-legend__line--critical", label: t("Critical boundary") },
    { kind: "area", className: "chart-inline-legend__area--type1", label: t("Type I error area") },
    { kind: "area", className: "chart-inline-legend__area--type2", label: t("Type II error area") },
  ];

  const getCriticalValueLabel = () => {
    const values = criticalValue.map((v) => v.toFixed(2));
    if (testType === "two-tailed") return values.join(language === "zh" ? " 和 " : " and ");
    return values[0] ?? "--";
  };

  const getInterpretation = () => {
    if (computed.power >= 0.8)
      return "This setting has strong power, so the test is fairly likely to detect the true effect.";
    if (computed.power >= 0.5)
      return "This setting has moderate power. Students can discuss how alpha, spread, and effect size interact.";
    return "This setting has low power, which makes Type II errors common even when a real effect exists.";
  };

  const getStrategyTip = () => {
    if (Math.abs(computed.effectSize) < 0.5)
      return "The true mean is still close to the null mean, so the two curves overlap heavily.";
    if (params.alpha <= 0.05)
      return "A strict alpha protects against false positives, but it can widen the acceptance region and raise beta.";
    return "A larger alpha lowers beta here, but the blue Type I region also expands.";
  };

  const getTestTypeLabel = () =>
    language === "zh"
      ? testType === "two-tailed"
        ? "双边检验"
        : "单边检验"
      : testType.replace("-", " ");

  const formatRate = (v: number) => `${(v * 100).toFixed(1)}%`;
  const formatNumber = (v: number) => v.toFixed(2);

  return (
    <div className="module-shell">
      <div className="module-layout">
        <div className="experiment-board">
          <div className="experiment-header">
            <div>
              <p className="eyebrow">{t("Core Visualizer")}</p>
              <h1>{t("Type I / II Error")}</h1>
              <p>{t("Adjust alpha, move the true mean, and watch rejection regions, beta, and power update together.")}</p>
            </div>
          </div>
          <div className="output-dock">
            <div className="output-heading">
              <p className="eyebrow">{t("Model output")}</p>
              <h2>{t("Decision regions and overlapping distributions")}</h2>
              <p>{t("The blue curve represents the null hypothesis, the red curve the true distribution, and the shaded regions show the two kinds of error.")}</p>
            </div>
            <div className="chart-frame">
              <svg width={WIDTH} height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`}>
                <g transform={`translate(${MARGIN.left}, ${MARGIN.top})`}>
                  <path d={nullPath} fill="none" stroke="var(--chart-blue)" strokeWidth={2} />
                  <path d={truePath} fill="none" stroke="var(--teal)" strokeWidth={2} />
                  <path d={type1AreaPath} fill="var(--lavender)" opacity={0.24} />
                  <path d={type2AreaPath} fill="var(--danger)" opacity={0.24} />
                  {criticalValue.map((cv, i) => (
                    <line
                      key={i}
                      x1={scales.xScale(cv)}
                      x2={scales.xScale(cv)}
                      y1={scales.yScale(0)}
                      y2={scales.yScale(0.5)}
                      stroke="var(--text-primary)"
                      strokeDasharray="5,5"
                    />
                  ))}
                  <g transform={`translate(0, ${plotHeight})`} ref={(g) => {
                    if (g) d3.select(g).call(d3.axisBottom(scales.xScale).ticks(6));
                  }} />
                  <g ref={(g) => {
                    if (g) d3.select(g).call(d3.axisLeft(scales.yScale).ticks(6));
                  }} />
                  <text
                    className="chart-axis-label"
                    x={plotWidth / 2}
                    y={HEIGHT - MARGIN.top - 8}
                    textAnchor="middle"
                  >
                    {t("Test Statistic")}
                  </text>
                  <text
                    className="chart-axis-label"
                    transform={`translate(${-36}, ${plotHeight / 2}) rotate(-90)`}
                    textAnchor="middle"
                  >
                    {t("Density")}
                  </text>
                  <text x={10} y={20} textAnchor="start" fontWeight="bold" fontSize={14}>
                    {computed.hypothesisText.H0Text}
                  </text>
                  <text x={10} y={40} textAnchor="start" fontWeight="bold" fontSize={14}>
                    {computed.hypothesisText.H1Text}
                  </text>
                  <g
                    className="chart-inline-legend"
                    transform={`translate(${Math.max(16, plotWidth - 206 - 14)}, 12)`}
                  >
                    <rect
                      className="chart-inline-legend__panel"
                      width={206}
                      height={112}
                      rx={12}
                      ry={12}
                    />
                    <text className="chart-inline-legend__title" x={12} y={20}>
                      {t("Legend")}
                    </text>
                    {legendRows.map((row, i) => {
                      const y = 38 + i * 15;
                      return (
                        <g key={i} className="chart-inline-legend__row">
                          {row.kind === "area" ? (
                            <rect
                              className={`chart-inline-legend__area ${row.className}`}
                              x={12}
                              y={y - 7}
                              width={18}
                              height={9}
                              rx={3}
                              ry={3}
                            />
                          ) : (
                            <line
                              className={`chart-inline-legend__line ${row.className}`}
                              x1={12}
                              x2={30}
                              y1={y - 3}
                              y2={y - 3}
                            />
                          )}
                          <text className="chart-inline-legend__label" x={38} y={y}>
                            {row.label}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                </g>
              </svg>
            </div>
          </div>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">{t("Alpha")}</span>
              <span className="metric-value">{formatRate(computed.typeOneErrorRate)}</span>
              <small className="metric-note">{t("Probability of rejecting H0 when H0 is true.")}</small>
            </div>
            <div className="metric-card">
              <span className="metric-label">{language === "zh" ? "β" : "Beta"}</span>
              <span className="metric-value">{formatRate(computed.typeTwoErrorRate)}</span>
              <small className="metric-note">{t("Probability of missing a real effect.")}</small>
            </div>
            <div className="metric-card">
              <span className="metric-label">{t("Power")}</span>
              <span className="metric-value">{formatRate(computed.power)}</span>
              <small className="metric-note">{t("Probability of correctly detecting the effect.")}</small>
            </div>
            <div className="metric-card">
              <span className="metric-label">{t("Effect Size")}</span>
              <span className="metric-value">{formatNumber(computed.effectSize)}</span>
              <small className="metric-note">{t("Distance between true mean and null mean.")}</small>
            </div>
          </div>
        </div>
        <div className="teaching-area">
          <div className="teaching-panel parameter-panel">
            <p className="eyebrow">{t("Parameters")}</p>
            <div className="test-type-tabs">
              <div className="test-type-tabs__label">{t("Hypothesis")}</div>
              <div className="test-type-tabs__buttons">
                <button
                  type="button"
                  className="test-type-tab"
                  data-test-type="right-tailed"
                  data-active={String(testType === "right-tailed")}
                  onClick={() => setTestType("right-tailed")}
                >
                  {t("One-sided")}
                </button>
                <button
                  type="button"
                  className="test-type-tab"
                  data-test-type="two-tailed"
                  data-active={String(testType === "two-tailed")}
                  onClick={() => setTestType("two-tailed")}
                >
                  {t("Two-sided")}
                </button>
              </div>
            </div>
            <div className="control-panel">
              <div className="control-panel__title">{t("Control Panel")}</div>
              <p className="control-panel__intro">
                {t("Change the decision rule and effect size to see how the shaded error regions respond.")}
              </p>
              {[
                { id: "alpha", label: t("Alpha (α)"), hint: t("Sets the false-positive rate and controls the rejection region."), min: 0.01, max: 0.2, step: 0.01, value: params.alpha, key: "alpha" as const },
                { id: "null-mean", label: t("Null Mean (μ₀)"), hint: t("Defines the center of the null distribution."), min: -2, max: 2, step: 0.1, value: params.nullMean, key: "nullMean" as const },
                { id: "true-mean", label: t("True Mean (μ₁)"), hint: t("Moves the true distribution and changes the effect size."), min: 0, max: 3, step: 0.1, value: params.trueMean, key: "trueMean" as const },
                { id: "std-dev", label: t("Standard Deviation (σ)"), hint: t("Wider distributions increase overlap and usually raise beta."), min: 0.1, max: 2, step: 0.1, value: params.stdDev, key: "stdDev" as const },
              ].map((slider) => (
                <div className="control-panel__slider" key={slider.id}>
                  <div className="control-panel__label-row">
                    <label className="control-panel__label" htmlFor={slider.id}>
                      {slider.label}
                    </label>
                    <span className="control-panel__value">{formatNumber(slider.value)}</span>
                  </div>
                  <p className="control-panel__hint">{slider.hint}</p>
                  <input
                    className="control-panel__input"
                    type="range"
                    id={slider.id}
                    min={slider.min}
                    max={slider.max}
                    step={slider.step}
                    value={slider.value}
                    onChange={(e) =>
                      setParams((p) => ({ ...p, [slider.key]: Number(e.target.value) }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="teaching-panel">
            <p className="eyebrow">{t("Concept + key idea")}</p>
            <h2>{t("Two kinds of error")}</h2>
            <p>{t("A Type I error rejects a true null hypothesis. A Type II error fails to reject the null when a real effect exists.")}</p>
            <h3>{t("Alpha and power trade off")}</h3>
            <p>{t(getInterpretation())}</p>
            <p>{t(getStrategyTip())}</p>
          </div>
          <div className="teaching-panel">
            <p className="eyebrow">{t("Formula")}</p>
            <div className="latex-formula">
              <div className="math-expression">
                <span>Power = 1 −</span>
                <span className="math-symbol">β</span>
              </div>
            </div>
            <p>
              {language === "zh"
                ? `当前检验：${getTestTypeLabel()}。临界值：${getCriticalValueLabel()}。`
                : `Current test: ${getTestTypeLabel()}. Critical value: ${getCriticalValueLabel()}.`}
            </p>
          </div>
          <div className="teaching-panel">
            <p className="eyebrow">{t("How to read this")}</p>
            <h3>{t("Current hypotheses")}</h3>
            <div className="concept-strip">
              <div className="concept-item">
                <span className="concept-name">H0</span>
                <span className="concept-value">{computed.hypothesisText.H0Text}</span>
              </div>
              <div className="concept-item">
                <span className="concept-name">H1</span>
                <span className="concept-value">{computed.hypothesisText.H1Text}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
