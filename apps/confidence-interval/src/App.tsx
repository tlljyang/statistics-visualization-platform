import { useCallback, useMemo, useState } from "react";
import * as d3 from "d3";
import type { ScaleLinear } from "d3";
import { useLanguage } from "@stats-viz/shared/i18n";
import { confidenceIntervalCopy } from "@stats-viz/shared/i18n";

interface Sample {
  lower: number;
  upper: number;
  mean: number;
  contains: boolean;
}

interface Config {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  populationMean: number;
}

interface Scales {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

function createRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateSample(
  mean: number,
  stddev: number,
  n: number,
  rng: () => number = Math.random,
): number[] {
  const samples: number[] = [];
  for (let i = 0; i < n; i++) {
    const u1 = Math.max(rng(), Number.EPSILON);
    const u2 = rng();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    samples.push(z * stddev + mean);
  }
  return samples;
}

function zScore(confidenceLevel: number): number {
  if (confidenceLevel === 0.95) return 1.96;
  if (confidenceLevel === 0.99) return 2.5758;
  if (confidenceLevel === 0.9) return 1.6449;
  if (confidenceLevel === 0.8) return 1.2816;
  return 1.96;
}

function ci(
  samples: number[],
  confidenceLevel: number,
  populationMean: number,
  stddev: number,
): Sample {
  if (samples.length === 0) {
    return { lower: Number.NaN, upper: Number.NaN, mean: Number.NaN, contains: false };
  }
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const z = zScore(confidenceLevel);
  const margin = (z * stddev) / Math.sqrt(samples.length);
  const lower = mean - margin;
  const upper = mean + margin;
  return { lower, upper, mean, contains: lower <= populationMean && upper >= populationMean };
}

function calculateCoverage(samples: Sample[]): number {
  const n = samples.length;
  if (!n) return 0;
  return samples.filter((x) => x.contains).length / n;
}

function createScales(
  width: number,
  height: number,
  margin: Config["margin"],
  samples: Sample[],
): Scales {
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const xScale = d3.scaleLinear().domain([5, 15]).range([0, chartWidth]);
  const yScale = d3.scaleLinear().domain([0, 1]).range([chartHeight, 0]);
  if (samples && samples.length > 0) {
    yScale.domain([0, samples.length]);
    const maxValue = d3.max(samples, (d) => d.upper)! * 1.1;
    const minValue = d3.min(samples, (d) => d.lower)! * 0.9;
    xScale.domain([Math.min(minValue, 5), Math.max(maxValue, 15)]);
  }
  return { xScale, yScale };
}

const defaultConfig: Config = {
  width: 760,
  height: 360,
  margin: { top: 24, right: 32, bottom: 56, left: 56 },
  populationMean: 10,
};

export default function ConfidenceIntervalApp() {
  const language = useLanguage();
  const copy = confidenceIntervalCopy[language];
  const [sampleSize, setSampleSize] = useState(10);
  const [populationSD, setPopulationSD] = useState(2);
  const [confidenceLevel, setConfidenceLevel] = useState(0.95);
  const [samples, setSamples] = useState<Sample[]>([]);
  const [seed, setSeed] = useState(42);
  const [collapsed, setCollapsed] = useState(false);

  const coverage = useMemo(() => calculateCoverage(samples), [samples]);
  const scales = useMemo(
    () => createScales(defaultConfig.width, defaultConfig.height, defaultConfig.margin, samples),
    [samples],
  );

  const addSamples = useCallback(
    (count: number) => {
      setSamples((prev) => {
        const rng = createRandom(seed);
        const newSamples: Sample[] = [];
        for (let i = 0; i < count; i++) {
          const arr = generateSample(defaultConfig.populationMean, populationSD, sampleSize, rng);
          newSamples.push(ci(arr, confidenceLevel, defaultConfig.populationMean, populationSD));
        }
        return [...prev, ...newSamples];
      });
      setSeed((s) => s + count);
    },
    [seed, populationSD, sampleSize, confidenceLevel],
  );

  const reset = useCallback(() => {
    setSamples([]);
    setSeed(42);
  }, []);

  const handleSampleSize = useCallback((value: number) => {
    setSampleSize(value);
    setSamples([]);
    setSeed(42);
  }, []);

  const handlePopulationSD = useCallback((value: number) => {
    setPopulationSD(value);
    setSamples([]);
    setSeed(42);
  }, []);

  const handleConfidenceLevel = useCallback((value: number) => {
    setConfidenceLevel(value);
    setSamples([]);
    setSeed(42);
  }, []);

  const sampleCount = samples.length;
  const misses = sampleCount - samples.filter((s) => s.contains).length;
  const averageWidth =
    sampleCount === 0
      ? 0
      : samples.reduce((sum, s) => sum + (s.upper - s.lower), 0) / sampleCount;
  const zValue = zScore(confidenceLevel);
  const interpretation =
    sampleCount === 0
      ? copy.emptyInterpretation
      : coverage >= confidenceLevel
        ? copy.healthyInterpretation
        : copy.lowCoverageInterpretation;

  const { width, height, margin } = defaultConfig;
  const marginTop = margin.top;
  const marginBottom = margin.bottom;
  const marginLeft = margin.left;
  const chartHeight = height - marginTop - marginBottom;
  const trueMeanX = scales.xScale(defaultConfig.populationMean);

  return (
    <div className="module-shell">
      <div className="module-layout">
        <div className="experiment-board">
          <div className="experiment-header">
            <div>
              <p className="eyebrow">{copy.coreVisualizer}</p>
              <h1>{copy.title}</h1>
              <p className="module-kicker">{copy.kicker}</p>
              <p className="module-description">{copy.description}</p>
            </div>
          </div>
          <div className="output-dock">
            <div className="output-heading">
              <div>
                <p className="eyebrow">{copy.modelOutput}</p>
                <h2>{copy.chartTitle}</h2>
                <p>{copy.chartDescription}</p>
              </div>
              <span className="sample-pill">{copy.samples.replace("{count}", String(sampleCount))}</span>
            </div>
            <div className="chart-legend">
              <span className="legend-item">
                <span className="legend-swatch legend-swatch--capture" />
                <span>{copy.capturesTrueMean}</span>
              </span>
              <span className="legend-item">
                <span className="legend-swatch legend-swatch--miss" />
                <span>{copy.missesTrueMean}</span>
              </span>
              <span className="legend-item">
                <span className="legend-swatch legend-swatch--true" />
                <span>{copy.trueMean.replace("{mean}", String(defaultConfig.populationMean))}</span>
              </span>
            </div>
            <div className="chart-frame">
              <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
                <g transform={`translate(${marginLeft}, ${marginTop})`}>
                  <g transform={`translate(0, ${chartHeight})`} ref={(g) => {
                    if (g) d3.select(g).call(d3.axisBottom(scales.xScale).ticks(6).tickSizeOuter(0));
                  }} />
                  <g ref={(g) => {
                    if (g) d3.select(g).call(d3.axisLeft(scales.yScale).ticks(6).tickSizeOuter(0));
                  }} />
                  <line
                    x1={trueMeanX}
                    y1={0}
                    x2={trueMeanX}
                    y2={chartHeight}
                    stroke="var(--chart-blue)"
                    strokeWidth={1.8}
                    strokeDasharray="6,7"
                  />
                  <text x={trueMeanX} y={15} fill="var(--chart-blue)">
                    {copy.trueMean.replace("{mean}", String(defaultConfig.populationMean))}
                  </text>
                  {samples.map((sample, i) => {
                    const x1 = scales.xScale(sample.lower);
                    const x2 = scales.xScale(sample.upper);
                    const meanX = scales.xScale(sample.mean);
                    const y = scales.yScale(i + 0.5);
                    const color = sample.contains ? "var(--sage)" : "var(--danger)";
                    return (
                      <g key={i} className="ci-group">
                        <line
                          className="ci-line"
                          y1={y}
                          y2={y}
                          x1={x1}
                          x2={x2}
                          stroke={color}
                          strokeWidth={2}
                          strokeLinecap="round"
                        />
                        <circle
                          className="sample-mean"
                          cx={meanX}
                          cy={y}
                          r={5.5}
                          fill={sample.contains ? "var(--deep-teal)" : "var(--danger)"}
                          stroke="var(--chart-bg)"
                          strokeWidth={2}
                        />
                      </g>
                    );
                  })}
                </g>
                <text
                  className="chart-axis-label"
                  x={width / 2}
                  y={height - 10}
                  textAnchor="middle"
                >
                  {copy.populationScale}
                </text>
                <text
                  className="chart-axis-label"
                  transform={`translate(16, ${height / 2}) rotate(-90)`}
                  textAnchor="middle"
                >
                  {copy.sampleIndex}
                </text>
              </svg>
            </div>
          </div>
          <div className="metrics-grid">
            <div className="metric-card">
              <span className="metric-label">{copy.observedCoverage}</span>
              <span className="metric-value">{(coverage * 100).toFixed(1)}%</span>
              <small className="metric-note">{copy.observedCoverageNote}</small>
            </div>
            <div className="metric-card">
              <span className="metric-label">{copy.samplesDrawn}</span>
              <span className="metric-value">{sampleCount}</span>
              <small className="metric-note">{copy.samplesDrawnNote}</small>
            </div>
            <div className="metric-card">
              <span className="metric-label">{copy.averageIntervalWidth}</span>
              <span className="metric-value">{averageWidth.toFixed(2)}</span>
              <small className="metric-note">{copy.averageIntervalWidthNote}</small>
            </div>
            <div className="metric-card">
              <span className="metric-label">{copy.zMultiplier}</span>
              <span className="metric-value">{zValue.toFixed(2)}</span>
              <small className="metric-note">{copy.zMultiplierNote}</small>
            </div>
          </div>
        </div>
        <div className="teaching-area">
          <div className="teaching-panel parameter-panel">
            <p className="eyebrow">{copy.parameters}</p>
            <div id="sidebar" className={`control-sidebar${collapsed ? " collapsed" : ""}`}>
              <button
                id="toggleSidebar"
                className="control-panel__toggle"
                onClick={() => setCollapsed((c) => !c)}
              >
                {collapsed ? "❯" : "❮"}
              </button>
              {!collapsed && (
                <div className="control-panel">
                  <div className="control-panel__title">{copy.controlsTitle}</div>
                  <div className="control-panel__intro">{copy.controlsIntro}</div>
                  <div className="control-panel__group">
                    <div className="control-panel__label-row">
                      <div className="control-panel__label">{copy.sampleSize}</div>
                      <div className="control-panel__value">{sampleSize}</div>
                    </div>
                    <div className="control-panel__hint">{copy.sampleSizeHint}</div>
                    <input
                      id="sampleSize"
                      type="range"
                      className="form-range control-panel__input"
                      min={1}
                      max={100}
                      value={sampleSize}
                      onChange={(e) => handleSampleSize(Number(e.target.value))}
                    />
                  </div>
                  <div className="control-panel__group">
                    <div className="control-panel__label-row">
                      <div className="control-panel__label">{copy.populationSD}</div>
                      <div className="control-panel__value">{populationSD.toFixed(1)}</div>
                    </div>
                    <div className="control-panel__hint">{copy.populationSDHint}</div>
                    <input
                      id="populationSD"
                      type="range"
                      className="form-range control-panel__input"
                      min={0.1}
                      max={10}
                      step={0.1}
                      value={populationSD}
                      onChange={(e) => handlePopulationSD(Number(e.target.value))}
                    />
                  </div>
                  <div className="control-panel__group">
                    <div className="control-panel__label-row">
                      <div className="control-panel__label">{copy.confidenceLevel}</div>
                      <div className="control-panel__value">{Math.round(confidenceLevel * 100)}%</div>
                    </div>
                    <div className="control-panel__hint">{copy.confidenceLevelHint}</div>
                    <select
                      id="confidenceLevel"
                      className="form-select control-panel__select"
                      value={String(confidenceLevel)}
                      onChange={(e) => handleConfidenceLevel(Number(e.target.value))}
                    >
                      <option value="0.8">80%</option>
                      <option value="0.9">90%</option>
                      <option value="0.95">95%</option>
                      <option value="0.99">99%</option>
                    </select>
                  </div>
                  <div className="control-panel__info-box">
                    <div className="control-panel__info-icon">i</div>
                    <div>{copy.confidenceInfo}</div>
                  </div>
                </div>
              )}
            </div>
            <div className="studio-control-bar studio-control-bar--side">
              <div className="studio-control-bar__buttons">
                <button
                  id="generateSample"
                  className="studio-button studio-button--primary"
                  onClick={() => addSamples(1)}
                >
                  <span className="studio-button__icon">+</span>
                  <span>{copy.generateOne}</span>
                </button>
                <button
                  id="generateMultiple"
                  className="studio-button studio-button--secondary"
                  onClick={() => addSamples(20)}
                >
                  <span className="studio-button__icon">⋯</span>
                  <span>{copy.generateTwenty}</span>
                </button>
                <button
                  id="reset"
                  className="studio-button studio-button--danger"
                  onClick={reset}
                >
                  <span className="studio-button__icon">↺</span>
                  <span>{copy.reset}</span>
                </button>
              </div>
              <span className="studio-control-bar__hint">{copy.controlHint}</span>
            </div>
          </div>
          <div className="teaching-panel">
            <p className="eyebrow">{copy.conceptKeyIdea}</p>
            <div className="concept-block">
              <span className="concept-icon">◎</span>
              <div>
                <h2>{copy.whatIsTitle}</h2>
                <p>{copy.whatIsBody}</p>
              </div>
            </div>
            <div className="concept-divider" />
            <div className="concept-block">
              <span className="concept-icon">▥</span>
              <div>
                <h3>{copy.coverageTitle}</h3>
                <p>{copy.coverageBody}</p>
              </div>
            </div>
          </div>
          <div className="teaching-panel">
            <p className="eyebrow">{copy.formula}</p>
            <div className="latex-formula">
              <div className="math-expression">
                <span>{copy.estimate}</span>
                <span className="math-symbol">±</span>
                <span>{copy.criticalValue}</span>
                <span className="math-symbol">×</span>
                <span>{copy.se}</span>
              </div>
            </div>
            <p>{copy.formulaNote.replace("{zValue}", zValue.toFixed(2)).replace("{populationMean}", defaultConfig.populationMean.toFixed(1))}</p>
          </div>
          <div className="teaching-panel">
            <p className="eyebrow">{copy.howToReadThis}</p>
            <h3>{copy.currentInterpretation}</h3>
            <p>{interpretation}</p>
            <p>{sampleCount === 0 ? copy.emptyPrompt : copy.missPrompt.replace("{misses}", String(misses))}</p>
          </div>
          <div className="teaching-panel learning-note">
            <p className="eyebrow">{copy.learningNote}</p>
            <p>{copy.learningNoteBody}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
