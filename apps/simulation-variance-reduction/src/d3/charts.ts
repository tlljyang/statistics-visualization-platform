import { svg } from "@cycle/dom";
import type { VNode } from "@cycle/dom";
import * as d3 from "d3";
import type { ChartPoint, ChartSpec } from "../components/SimulationVarianceReductionApp/types";

const width = 760;
const height = 380;
const margin = { top: 34, right: 24, bottom: 54, left: 64 };

function extent(values: number[], fallback: [number, number]): [number, number] {
  const min = values.reduce((a, b) => Math.min(a, b), Infinity);
  const max = values.reduce((a, b) => Math.max(a, b), -Infinity);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return fallback;
  if (min === max) return [min - 1, max + 1];
  return [min, max];
}

function axisTicks(scale: d3.ScaleLinear<number, number>, orientation: "x" | "y"): VNode[] {
  return scale.ticks(5).map((tick) => {
    const x = orientation === "x" ? scale(tick) : margin.left;
    const y = orientation === "x" ? height - margin.bottom : scale(tick);
    return svg.g([
      orientation === "x"
        ? svg.line({ attrs: { x1: x, x2: x, y1: y, y2: y + 6, stroke: "#94a3b8" } })
        : svg.line({ attrs: { x1: x - 6, x2: x, y1: y, y2: y, stroke: "#94a3b8" } }),
      svg.text(
        {
          attrs: {
            x: orientation === "x" ? x : x - 10,
            y: orientation === "x" ? y + 22 : y + 4,
            "text-anchor": orientation === "x" ? "middle" : "end",
            fill: "#64748b",
            "font-size": 11
          }
        },
        String(Number(tick.toFixed(3)))
      )
    ]);
  });
}

function frame(title: string, xLabel: string, yLabel: string, children: VNode[]): VNode {
  return svg(
    {
      attrs: {
        class: "teaching-chart",
        viewBox: `0 0 ${width} ${height}`,
        role: "img",
        "aria-label": title
      }
    },
    [
      svg.rect({ attrs: { x: 0, y: 0, width, height, rx: 8, fill: "#ffffff" } }),
      svg.text({ attrs: { x: margin.left, y: 22, fill: "#111827", "font-size": 16, "font-weight": 700 } }, title),
      svg.text({ attrs: { x: width / 2, y: height - 12, fill: "#475569", "font-size": 12, "text-anchor": "middle" } }, xLabel),
      svg.text({ attrs: { x: 18, y: height / 2, fill: "#475569", "font-size": 12, "text-anchor": "middle", transform: `rotate(-90 18 ${height / 2})` } }, yLabel),
      ...children
    ]
  );
}

function renderScatter(spec: Extract<ChartSpec, { type: "scatter" }>): VNode {
  const xDomain = spec.xDomain ?? extent(spec.points.map((point) => point.x).concat(spec.line?.points.map((point) => point.x) ?? []), [0, 1]);
  const yDomain = spec.yDomain ?? extent(spec.points.map((point) => point.y).concat(spec.line?.points.map((point) => point.y) ?? []), [0, 1]);
  const x = d3.scaleLinear().domain(xDomain).nice().range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain(yDomain).nice().range([height - margin.bottom, margin.top]);
  const line = d3.line<ChartPoint>().x((point) => x(point.x)).y((point) => y(point.y));
  return frame(spec.title, spec.xLabel, spec.yLabel, [
    svg.line({ attrs: { x1: margin.left, x2: width - margin.right, y1: height - margin.bottom, y2: height - margin.bottom, stroke: "#cbd5e1" } }),
    svg.line({ attrs: { x1: margin.left, x2: margin.left, y1: margin.top, y2: height - margin.bottom, stroke: "#cbd5e1" } }),
    ...axisTicks(x, "x"),
    ...axisTicks(y, "y"),
    ...(spec.line ? [svg.path({ attrs: { d: line(spec.line.points) ?? "", fill: "none", stroke: spec.line.color ?? "#d1495b", "stroke-width": 3 } })] : []),
    ...spec.points.map((point) =>
      svg.circle({
        attrs: {
          cx: x(point.x),
          cy: y(point.y),
          r: point.label ? 4.5 : 3,
          fill: point.color ?? "#136f63",
          opacity: 0.78
        }
      })
    )
  ]);
}

function renderLine(spec: Extract<ChartSpec, { type: "line" }>): VNode {
  const points = spec.series.flatMap((series) => series.points);
  const xDomain = spec.xDomain ?? extent(points.map((point) => point.x), [0, 1]);
  const yDomain = spec.yDomain ?? extent(points.map((point) => point.y), [0, 1]);
  const x = d3.scaleLinear().domain(xDomain).nice().range([margin.left, width - margin.right]);
  const y = d3.scaleLinear().domain(yDomain).nice().range([height - margin.bottom, margin.top]);
  const line = d3.line<ChartPoint>().x((point) => x(point.x)).y((point) => y(point.y));
  return frame(spec.title, spec.xLabel, spec.yLabel, [
    svg.line({ attrs: { x1: margin.left, x2: width - margin.right, y1: height - margin.bottom, y2: height - margin.bottom, stroke: "#cbd5e1" } }),
    svg.line({ attrs: { x1: margin.left, x2: margin.left, y1: margin.top, y2: height - margin.bottom, stroke: "#cbd5e1" } }),
    ...axisTicks(x, "x"),
    ...axisTicks(y, "y"),
    ...spec.series.map((series) => svg.path({ attrs: { d: line(series.points) ?? "", fill: "none", stroke: series.color ?? "#136f63", "stroke-width": 3 } }))
  ]);
}

function renderBars(spec: Extract<ChartSpec, { type: "bars" }>): VNode {
  const maxValue = Math.max(...spec.bars.map((bar) => bar.value), 1);
  const yDomain = spec.yDomain ?? [0, maxValue * 1.15] as [number, number];
  const x = d3.scaleBand().domain(spec.bars.map((bar) => bar.label)).range([margin.left, width - margin.right]).padding(0.18);
  const y = d3.scaleLinear().domain(yDomain).nice().range([height - margin.bottom, margin.top]);
  return frame(spec.title, spec.xLabel, spec.yLabel, [
    svg.line({ attrs: { x1: margin.left, x2: width - margin.right, y1: height - margin.bottom, y2: height - margin.bottom, stroke: "#cbd5e1" } }),
    svg.line({ attrs: { x1: margin.left, x2: margin.left, y1: margin.top, y2: height - margin.bottom, stroke: "#cbd5e1" } }),
    ...axisTicks(y, "y"),
    ...spec.bars.map((bar) =>
      svg.rect({
        attrs: {
          x: x(bar.label) ?? margin.left,
          y: y(bar.value),
          width: x.bandwidth(),
          height: Math.max(0, height - margin.bottom - y(bar.value)),
          fill: bar.color ?? "#136f63",
          opacity: 0.86
        }
      })
    )
  ]);
}

function renderIntervals(spec: Extract<ChartSpec, { type: "intervals" }>): VNode {
  const values = spec.intervals.flatMap((interval) => [interval.lower, interval.upper, interval.center]);
  const xDomain = spec.xDomain ?? extent(values, [0, 1]);
  const x = d3.scaleLinear().domain(xDomain).nice().range([margin.left, width - margin.right]);
  const y = d3.scaleBand().domain(spec.intervals.map((interval) => interval.label)).range([margin.top, height - margin.bottom]).padding(0.35);
  return frame(spec.title, spec.xLabel, spec.yLabel, [
    svg.line({ attrs: { x1: margin.left, x2: width - margin.right, y1: height - margin.bottom, y2: height - margin.bottom, stroke: "#cbd5e1" } }),
    ...axisTicks(x, "x"),
    ...(spec.reference !== undefined ? [svg.line({ attrs: { x1: x(spec.reference), x2: x(spec.reference), y1: margin.top, y2: height - margin.bottom, stroke: "#64748b", "stroke-dasharray": "5 5" } })] : []),
    ...spec.intervals.flatMap((interval) => {
      const yCenter = (y(interval.label) ?? 0) + y.bandwidth() / 2;
      return [
        svg.line({ attrs: { x1: x(interval.lower), x2: x(interval.upper), y1: yCenter, y2: yCenter, stroke: interval.color ?? "#136f63", "stroke-width": 5, "stroke-linecap": "round" } }),
        svg.circle({ attrs: { cx: x(interval.center), cy: yCenter, r: 6, fill: interval.color ?? "#136f63" } }),
        svg.text({ attrs: { x: margin.left - 10, y: yCenter + 4, "text-anchor": "end", fill: "#475569", "font-size": 12 } }, interval.label)
      ];
    })
  ]);
}

export function chartToVNode(spec: ChartSpec): VNode {
  if (spec.type === "scatter") return renderScatter(spec);
  if (spec.type === "line") return renderLine(spec);
  if (spec.type === "intervals") return renderIntervals(spec);
  return renderBars(spec);
}
