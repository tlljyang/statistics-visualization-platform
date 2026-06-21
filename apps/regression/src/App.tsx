import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import * as d3 from "d3";
import { localizeText, useLanguage } from "@stats-viz/shared/i18n";
import { getRegressionDataBaseUrl } from "./dataBaseUrl";

interface Point {
  x: number;
  y: number;
  outlier?: boolean;
}

interface Dataset {
  id: string;
  name: string;
  source?: string;
  xLabel?: string;
  yLabel?: string;
  data: Point[];
}

const MARGINS = { top: 34, right: 34, bottom: 58, left: 64 };
const WIDTH = 860;
const HEIGHT = 520;

const DATASET_PATHS = [
  "data/outlier-impact.json",
  "data/positive-correlation.json",
  "data/negative-correlation.json",
  "data/no-correlation.json",
  "data/strong-linear.json",
  "data/exponential-growth.json",
  "data/textbook/chapter-8-height-exercise-hours.json",
  "data/textbook/chapter-8-height-latitude.json",
  "data/textbook/chapter-8-height-father-height.json",
  "data/textbook/chapter-8-height-mother-height.json",
  "data/textbook/chapter-8-height-sleep-hours.json",
  "data/textbook/chapter-8-skyscrapers-built-gdp.json",
  "data/textbook/chapter-8-skyscrapers-planned-gdp.json",
  "data/textbook/chapter-8-us-population-year.json",
  "data/textbook/chapter-8-book-spending-education.json",
  "data/textbook/chapter-8-book-spending-income.json",
  "data/textbook/chapter-8-tourism-gdp.json",
  "data/textbook/chapter-8-tourism-restaurants.json",
  "data/textbook/chapter-8-tourism-hotels.json",
  "data/textbook/chapter-8-tourism-roads.json",
  "data/textbook/chapter-8-tourism-universities.json",
  "data/textbook/chapter-8-tourism-service-workers.json",
];

function mean(values: number[]): number {
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function annotateOutliers(dataset: Dataset): Dataset {
  if (dataset.data.some((p) => p.outlier)) return dataset;
  if (dataset.data.length < 8) return dataset;

  const xs = dataset.data.map((p) => p.x);
  const ys = dataset.data.map((p) => p.y);
  const xMean = mean(xs);
  const yMean = mean(ys);
  const sxx = xs.reduce((s, x) => s + (x - xMean) ** 2, 0);
  if (sxx <= Number.EPSILON) return dataset;

  const sxy = dataset.data.reduce((s, p) => s + (p.x - xMean) * (p.y - yMean), 0);
  const slope = sxy / sxx;
  const intercept = yMean - slope * xMean;
  const residuals = dataset.data.map((p) => p.y - (intercept + slope * p.x));
  const mse = residuals.reduce((s, r) => s + r * r, 0) / Math.max(dataset.data.length - 2, 1);
  if (!Number.isFinite(mse) || mse <= Number.EPSILON) return dataset;

  const rmse = Math.sqrt(mse);
  const cutoff = 4 / dataset.data.length;
  return {
    ...dataset,
    data: dataset.data.map((p, i) => {
      const leverage = Math.min(0.999999, 1 / dataset.data.length + (p.x - xMean) ** 2 / sxx);
      const studentized = Math.abs(residuals[i]) / (rmse * Math.sqrt(Math.max(1 - leverage, 1e-9)));
      const cooks = (residuals[i] ** 2 / (2 * mse)) * (leverage / Math.max((1 - leverage) ** 2, 1e-9));
      return studentized >= 2.5 || (studentized >= 2 && cooks > cutoff)
        ? { ...p, outlier: true }
        : p;
    }),
  };
}

function calculateRegression(data: Point[]) {
  const n = data.length;
  if (n === 0) return { slope: 0, intercept: 0, rSquared: 0 };
  const sumX = d3.sum(data, (d) => d.x);
  const sumY = d3.sum(data, (d) => d.y);
  const sumXY = d3.sum(data, (d) => d.x * d.y);
  const sumX2 = d3.sum(data, (d) => d.x * d.x);
  const denom = n * sumX2 - sumX * sumX;
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  const intercept = (sumY - slope * sumX) / n;
  const yMean = sumY / n;
  const ssTot = d3.sum(data, (d) => (d.y - yMean) ** 2);
  const ssRes = d3.sum(data, (d) => (d.y - (slope * d.x + intercept)) ** 2);
  return { slope, intercept, rSquared: ssTot !== 0 ? 1 - ssRes / ssTot : 0 };
}

function computeSSE(data: Point[], slope: number, intercept: number): number {
  return data.reduce((s, p) => s + (p.y - (slope * p.x + intercept)) ** 2, 0);
}

export default function RegressionApp() {
  const language = useLanguage();
  const t = (text: string) => localizeText(text, language);

  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [showRegression, setShowRegression] = useState(true);
  const [showOutliers, setShowOutliers] = useState(true);
  const [customLine, setCustomLine] = useState<{ start: Point | null; end: Point | null }>({
    start: null,
    end: null,
  });
  const [tempLine, setTempLine] = useState<{ start: Point | null; end: Point | null }>({
    start: null,
    end: null,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPoint, setHoverPoint] = useState<Point | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  // Load datasets
  useEffect(() => {
    const base = getRegressionDataBaseUrl(
      window.location.pathname,
      import.meta.env.BASE_URL,
      import.meta.env.DEV,
    );
    Promise.all(
      DATASET_PATHS.map(async (path) => {
        try {
          const res = await fetch(`${base}${path}`);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const json = await res.json();
          const id = path.split("/").pop()!.replace(".json", "");
          return {
            id,
            name: json.name ?? id,
            source: json.source,
            xLabel: json.xLabel,
            yLabel: json.yLabel,
            data: json.data as Point[],
          } as Dataset;
        } catch (err) {
          console.error(`Failed to load ${path}`, err);
          return null;
        }
      }),
    ).then((results) => {
      const valid = results.filter((d): d is Dataset => d !== null).map(annotateOutliers);
      setDatasets(valid);
      if (valid.length > 0) setSelectedId(valid[0].id);
    });
  }, []);

  const selectedDataset = useMemo(
    () => datasets.find((d) => d.id === selectedId) ?? datasets[0],
    [datasets, selectedId],
  );

  const visibleData = useMemo(() => {
    if (!selectedDataset) return [];
    return showOutliers ? selectedDataset.data : selectedDataset.data.filter((p) => !p.outlier);
  }, [selectedDataset, showOutliers]);

  const domains = useMemo(() => {
    if (visibleData.length === 0) return { x: [0, 1] as [number, number], y: [0, 1] as [number, number] };
    let xMin = Infinity, xMax = -Infinity, yMin = Infinity, yMax = -Infinity;
    for (const p of visibleData) {
      if (p.x < xMin) xMin = p.x;
      if (p.x > xMax) xMax = p.x;
      if (p.y < yMin) yMin = p.y;
      if (p.y > yMax) yMax = p.y;
    }
    const xPad = (xMax - xMin) * 0.1 || 1;
    const yPad = (yMax - yMin) * 0.1 || 1;
    return { x: [xMin - xPad, xMax + xPad] as [number, number], y: [yMin - yPad, yMax + yPad] as [number, number] };
  }, [visibleData]);

  const scales = useMemo(() => {
    const chartWidth = WIDTH - MARGINS.left - MARGINS.right;
    const chartHeight = HEIGHT - MARGINS.top - MARGINS.bottom;
    return {
      xScale: d3.scaleLinear().domain(domains.x).range([0, chartWidth]),
      yScale: d3.scaleLinear().domain(domains.y).range([chartHeight, 0]),
    };
  }, [domains]);

  const regression = useMemo(() => calculateRegression(visibleData), [visibleData]);

  const chartWidth = WIDTH - MARGINS.left - MARGINS.right;
  const chartHeight = HEIGHT - MARGINS.top - MARGINS.bottom;

  const getChartCoords = useCallback((e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const scaleX = svg.viewBox.baseVal.width / rect.width;
    const scaleY = svg.viewBox.baseVal.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX - MARGINS.left,
      y: (e.clientY - rect.top) * scaleY - MARGINS.top,
    };
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      const { x, y } = getChartCoords(e);
      setTempLine({ start: { x: scales.xScale.invert(x), y: scales.yScale.invert(y) }, end: null });
      setIsDragging(true);
    },
    [getChartCoords, scales],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isDragging) return;
      const { x, y } = getChartCoords(e);
      setTempLine((prev) => ({
        start: prev.start,
        end: { x: scales.xScale.invert(x), y: scales.yScale.invert(y) },
      }));
    },
    [isDragging, getChartCoords, scales],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent<SVGSVGElement>) => {
      if (!isDragging) return;
      const { x, y } = getChartCoords(e);
      setTempLine({ start: null, end: null });
      setIsDragging(false);
      setCustomLine((prev) => {
        const start = prev.start ?? tempLine.start;
        const end = { x: scales.xScale.invert(x), y: scales.yScale.invert(y) };
        if (!start || (start.x === end.x && start.y === end.y)) return { start: null, end: null };
        return { start, end };
      });
    },
    [isDragging, getChartCoords, scales, tempLine.start],
  );

  // Reset custom line when dataset or outliers toggle changes
  useEffect(() => {
    setCustomLine({ start: null, end: null });
  }, [selectedId, showOutliers]);

  const customLineData = useMemo(() => {
    if (!customLine.start || !customLine.end) return null;
    const { slope, intercept } = (() => {
      const dx = customLine.end.x - customLine.start.x;
      const slope = dx !== 0 ? (customLine.end.y - customLine.start.y) / dx : 0;
      return { slope, intercept: customLine.start.y - slope * customLine.start.x };
    })();
    return { slope, intercept };
  }, [customLine]);

  const sse = useMemo(() => {
    if (showRegression) {
      return { value: computeSSE(visibleData, regression.slope, regression.intercept), lineType: "regression" as const };
    }
    if (customLineData) {
      return { value: computeSSE(visibleData, customLineData.slope, customLineData.intercept), lineType: "custom" as const };
    }
    return { value: 0, lineType: null };
  }, [visibleData, showRegression, regression, customLineData]);

  const hoverInfo = useMemo(() => {
    if (!hoverPoint) return null;
    let lineY: number;
    let lineType: "regression" | "custom";
    if (showRegression) {
      lineY = regression.slope * hoverPoint.x + regression.intercept;
      lineType = "regression";
    } else if (customLineData) {
      lineY = customLineData.slope * hoverPoint.x + customLineData.intercept;
      lineType = "custom";
    } else {
      return null;
    }
    return { point: hoverPoint, lineY, residual: hoverPoint.y - lineY, lineType };
  }, [hoverPoint, showRegression, regression, customLineData]);

  const xGridTicks = scales.xScale.ticks(6);
  const yGridTicks = scales.yScale.ticks(6);

  const regressionLinePath = useMemo(() => {
    if (!showRegression) return "";
    const [xMin, xMax] = domains.x;
    const y1 = regression.slope * xMin + regression.intercept;
    const y2 = regression.slope * xMax + regression.intercept;
    const line = d3.line<Point>().x((d) => scales.xScale(d.x)).y((d) => scales.yScale(d.y));
    return line([{ x: xMin, y: y1 }, { x: xMax, y: y2 }]) ?? "";
  }, [showRegression, regression, domains, scales]);

  const customLinePath = useMemo(() => {
    if (!customLineData || !customLine.start || !customLine.end) return "";
    const [xMin, xMax] = domains.x;
    const y1 = customLineData.slope * xMin + customLineData.intercept;
    const y2 = customLineData.slope * xMax + customLineData.intercept;
    const line = d3.line<Point>().x((d) => scales.xScale(d.x)).y((d) => scales.yScale(d.y));
    return line([{ x: xMin, y: y1 }, { x: xMax, y: y2 }]) ?? "";
  }, [customLineData, customLine, domains, scales]);

  const tempLinePath = useMemo(() => {
    if (!tempLine.start || !tempLine.end || !isDragging) return "";
    const line = d3.line<Point>().x((d) => scales.xScale(d.x)).y((d) => scales.yScale(d.y));
    return line([tempLine.start, tempLine.end]) ?? "";
  }, [tempLine, isDragging, scales]);

  return (
    <div className="module-shell">
      <main className="module-layout">
        <section className="experiment-board">
          <header className="experiment-header">
            <div>
              <p className="eyebrow">{t("Core Visualizer")}</p>
              <h1>{t("Regression")}</h1>
              <p>{t("Choose a dataset, draw a custom line, and compare it with the least-squares regression fit.")}</p>
            </div>
          </header>
          <section className="output-dock">
            <div className="output-heading">
              <p className="eyebrow">{t("Model output")}</p>
              <h2>{t("Scatterplot and fitted lines")}</h2>
              <p>{t("Click and drag on the graph to draw a custom line, then compare it with the regression line.")}</p>
            </div>
            <div className="chart-frame">
              <div className="chart-shell">
                <svg
                  ref={svgRef}
                  width={WIDTH}
                  height={HEIGHT}
                  viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                  preserveAspectRatio="xMidYMid meet"
                  className="chart-svg"
                  role="img"
                  data-margin-left={MARGINS.left}
                  data-margin-top={MARGINS.top}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                >
                  <g transform={`translate(${MARGINS.left}, ${MARGINS.top})`}>
                    <rect className="plot-background" x={0} y={0} width={chartWidth} height={chartHeight} rx={14} />
                    <g className="chart-grid chart-grid--x">
                      {xGridTicks.map((tick, i) => (
                        <line key={i} x1={scales.xScale(tick)} y1={0} x2={scales.xScale(tick)} y2={chartHeight} />
                      ))}
                    </g>
                    <g className="chart-grid chart-grid--y">
                      {yGridTicks.map((tick, i) => (
                        <line key={i} x1={0} y1={scales.yScale(tick)} x2={chartWidth} y2={scales.yScale(tick)} />
                      ))}
                    </g>
                    <g transform={`translate(0, ${chartHeight})`} ref={(g) => { if (g) d3.select(g).call(d3.axisBottom(scales.xScale)); }} />
                    <g ref={(g) => { if (g) d3.select(g).call(d3.axisLeft(scales.yScale)); }} />
                    {visibleData.map((p, i) => (
                      <circle
                        key={i}
                        className={p.outlier ? "data-point data-point--outlier" : "data-point"}
                        cx={scales.xScale(p.x)}
                        cy={scales.yScale(p.y)}
                        r={5}
                        fill={p.outlier ? "var(--danger)" : "var(--teal)"}
                        opacity={p.outlier ? 0.86 : 0.82}
                        stroke="#fffdf8"
                        strokeWidth={2}
                        data-x={p.x}
                        data-y={p.y}
                        onMouseEnter={() => setHoverPoint(p)}
                        onMouseLeave={() => setHoverPoint(null)}
                      />
                    ))}
                    {regressionLinePath && (
                      <path d={regressionLinePath} className="regression-line" stroke="var(--chart-blue)" strokeWidth={2.4} fill="none" />
                    )}
                    {customLinePath && (
                      <path d={customLinePath} className="custom-line" stroke="var(--danger)" strokeWidth={2} fill="none" />
                    )}
                    {tempLinePath && (
                      <path d={tempLinePath} className="temp-line" stroke="var(--text-secondary)" strokeWidth={2} strokeDasharray="5,5" fill="none" />
                    )}
                    {hoverInfo && (
                      <>
                        <line
                          className="hover-vertical-line"
                          x1={scales.xScale(hoverInfo.point.x)}
                          y1={scales.yScale(hoverInfo.point.y)}
                          x2={scales.xScale(hoverInfo.point.x)}
                          y2={scales.yScale(hoverInfo.lineY)}
                          stroke="var(--danger)"
                          strokeWidth={1}
                          strokeDasharray="3,3"
                          opacity={0.7}
                        />
                        <circle
                          className="hovered-point-highlight"
                          cx={scales.xScale(hoverInfo.point.x)}
                          cy={scales.yScale(hoverInfo.point.y)}
                          r={8}
                          fill="none"
                          stroke="var(--danger)"
                          strokeWidth={2}
                        />
                      </>
                    )}
                    <text
                      className="chart-axis-label chart-axis-label--x"
                      x={chartWidth}
                      y={chartHeight + 42}
                      textAnchor="end"
                    >
                      {t(selectedDataset?.xLabel || "Explanatory variable")}
                    </text>
                    <text
                      className="chart-axis-label chart-axis-label--y"
                      x={-chartHeight / 2}
                      y={-46}
                      transform="rotate(-90)"
                      textAnchor="middle"
                    >
                      {t(selectedDataset?.yLabel || "Response")}
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </section>
          <section className="metrics-grid">
            <div className="statistics-panel">
              <h4 className="statistics-title">{t("Statistics")}</h4>
              <div className="sse-section">
                <div className="stat-row">
                  <span className="stat-label">{t("Sum of Squared Errors (SSE)")}</span>
                  <span className="stat-value">{sse.value.toFixed(4)}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">{t("Line Type")}</span>
                  <span className={`line-badge ${
                    sse.lineType === "regression"
                      ? "line-badge--regression"
                      : sse.lineType === "custom"
                        ? "line-badge--custom"
                        : "line-badge--none"
                  }`}>
                    {sse.lineType === "regression"
                      ? t("Regression Line")
                      : sse.lineType === "custom"
                        ? t("Custom Line")
                        : t("No Line")}
                  </span>
                </div>
              </div>
              <div className="residual-section">
                <div className="residual-row">
                  <span className="stat-label">{t("Hover")}</span>
                  {hoverInfo ? (
                    <div>
                      <span className="stat-value">
                        ({hoverInfo.point.x.toFixed(2)}, {hoverInfo.point.y.toFixed(2)})
                      </span>
                      <small className="stat-divider">|</small>
                      <span className="stat-label">{t("Res")}</span>
                      <span className="stat-value">{hoverInfo.residual.toFixed(4)}</span>
                      <small className="stat-divider">|</small>
                      <span className="stat-label">{t("Y hat")}</span>
                      <span className="stat-value">{hoverInfo.lineY.toFixed(4)}</span>
                    </div>
                  ) : (
                    <span className="stat-value stat-value--muted">{t("Hover over a point")}</span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </section>
        <aside className="teaching-area">
          <section className="teaching-panel parameter-panel">
            <p className="eyebrow">{t("Parameters")}</p>
            <div className="control-panel">
              <h2 className="control-panel__title">{t("Control Panel")}</h2>
              <p className="control-panel__intro">
                {t("Choose a dataset, reveal the regression line, and clear your hand-drawn line when you want to try again.")}
              </p>
              <div className="control-panel__group">
                <div className="control-panel__label-row">
                  <span className="control-panel__label">{t("Dataset")}</span>
                  <span className="control-panel__value">{String(datasets.length)}</span>
                </div>
                <p className="control-panel__hint">{t("Switch the scatterplot students are reasoning from.")}</p>
                <label className="sr-only" htmlFor="dataset-select">{t("Select Dataset")}</label>
                <select
                  id="dataset-select"
                  className="dataset-select control-panel__select"
                  value={selectedId}
                  disabled={datasets.length === 0}
                  onChange={(e) => setSelectedId(e.target.value)}
                >
                  {datasets.length === 0 && (
                    <option value="" disabled>No datasets available</option>
                  )}
                  {datasets.map((d) => (
                    <option key={d.id} value={d.id}>{t(d.name)}</option>
                  ))}
                </select>
              </div>
              <div className="control-panel__group">
                <label className="toggle-row" htmlFor="regression-toggle">
                  <span className="toggle-row__copy">
                    <span className="control-panel__label">{t("Regression line")}</span>
                    <span className="control-panel__hint">{t("Compare the model fit with a custom line.")}</span>
                  </span>
                  <input
                    id="regression-toggle"
                    type="checkbox"
                    className="regression-toggle toggle-row__input"
                    checked={showRegression}
                    onChange={(e) => setShowRegression(e.target.checked)}
                  />
                </label>
              </div>
              <div className="control-panel__group">
                <label className="toggle-row" htmlFor="outlier-toggle">
                  <span className="toggle-row__copy">
                    <span className="control-panel__label">{t("Outliers removed")}</span>
                    <span className="control-panel__hint">{t("Compare the fit with influential observations excluded.")}</span>
                  </span>
                  <input
                    id="outlier-toggle"
                    type="checkbox"
                    className="outlier-toggle toggle-row__input"
                    checked={!showOutliers}
                    onChange={(e) => setShowOutliers(!e.target.checked)}
                  />
                </label>
              </div>
              <div className="control-panel__actions">
                <button
                  type="button"
                  className="clear-custom-line control-panel__button"
                  onClick={() => setCustomLine({ start: null, end: null })}
                >
                  {t("Clear Custom Line")}
                </button>
              </div>
              {selectedDataset && (
                <div className="control-panel__summary-card">
                  <div className="info-item">
                    <span className="metric-label">{t("Selected dataset")}</span>
                    <span className="metric-value">{t(selectedDataset.name)}</span>
                  </div>
                  <div className="info-item">
                    <span className="metric-label">{t("Data points")}</span>
                    <span className="metric-value">
                      {selectedDataset.data.length -
                        (showOutliers ? 0 : selectedDataset.data.filter((p) => p.outlier).length)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="metric-label">{t("Outliers")}</span>
                    <span className="metric-value metric-value--compact">
                      {showOutliers ? t("Included") : t("Removed")}
                    </span>
                  </div>
                  {selectedDataset.source && (
                    <div className="info-item">
                      <span className="metric-label">{t("Source")}</span>
                      <span className="metric-value metric-value--compact">{t(selectedDataset.source)}</span>
                    </div>
                  )}
                  {selectedDataset.xLabel && (
                    <div className="info-item">
                      <span className="metric-label">{t("X variable")}</span>
                      <span className="metric-value metric-value--compact">{t(selectedDataset.xLabel)}</span>
                    </div>
                  )}
                  {selectedDataset.yLabel && (
                    <div className="info-item">
                      <span className="metric-label">{t("Y variable")}</span>
                      <span className="metric-value metric-value--compact">{t(selectedDataset.yLabel)}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
          <section className="teaching-panel">
            <p className="eyebrow">{t("Concept + key idea")}</p>
            <h2>{t("Least-squares regression")}</h2>
            <p>{t("Regression uses a line to describe the relationship between an explanatory variable and a response variable.")}</p>
            <h3>{t("Residuals explain fit")}</h3>
            <p>{t("The least-squares line is the line that minimizes the sum of squared residuals across the dataset.")}</p>
          </section>
          <section className="teaching-panel">
            <p className="eyebrow">{t("Formula")}</p>
            <div className="latex-formula">
              <div className="math-expression">
                <span>SSE =</span>
                <span className="math-symbol">Σ</span>
                <span>(y<sub>i</sub> − ŷ<sub>i</sub>)</span>
                <sup>2</sup>
              </div>
            </div>
            <p>{t("Compare the custom line and regression line by watching how SSE changes.")}</p>
          </section>
          <section className="teaching-panel">
            <p className="eyebrow">{t("Teaching notes")}</p>
            <h3>{t("Classroom focus")}</h3>
            <p>{t("Ask students to predict the slope first, draw their line, and then use residuals to explain why one line fits better.")}</p>
          </section>
        </aside>
      </main>
    </div>
  );
}
