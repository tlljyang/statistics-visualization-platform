import { svg } from "@cycle/dom";
import * as d3 from "d3";
import type { CriticalAreaFn, DistributionPoint, Scales } from "./types";

function drawNullDistribution(container: any, data: DistributionPoint[], scales: Scales): void {
  container.selectAll(".null-distribution").remove();

  container
    .append("path")
    .datum(data)
    .attr("class", "null-distribution")
    .attr(
      "d",
      d3
        .line<DistributionPoint>()
        .x((d) => scales.xScale(d.x))
        .y((d) => scales.yScale(d.y)),
    )
    .attr("stroke", "var(--chart-blue)")
    .attr("fill", "none")
    .attr("stroke-width", 2);
}

export function NullDistribution(props: {
  data: DistributionPoint[];
  scales: Scales;
}) {
  return svg.g({
    hook: {
      insert: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawNullDistribution(g, props.data, props.scales);
      },
      update: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawNullDistribution(g, props.data, props.scales);
      },
    },
  });
}

function drawTrueDistribution(container: any, data: DistributionPoint[], scales: Scales): void {
  container.selectAll(".true-distribution").remove();

  container
    .append("path")
    .datum(data)
    .attr("class", "true-distribution")
    .attr(
      "d",
      d3
        .line<DistributionPoint>()
        .x((d) => scales.xScale(d.x))
        .y((d) => scales.yScale(d.y)),
    )
    .attr("stroke", "var(--teal)")
    .attr("fill", "none")
    .attr("stroke-width", 2);
}

export function TrueDistribution(props: {
  data: DistributionPoint[];
  scales: Scales;
}) {
  return svg.g({
    hook: {
      insert: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawTrueDistribution(g, props.data, props.scales);
      },
      update: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawTrueDistribution(g, props.data, props.scales);
      },
    },
  });
}

function drawCriticalLine(container: any, criticalValue: number[], scales: Scales): void {
  container.selectAll(".critical-line").remove();

  container
    .selectAll(".critical-line")
    .data(criticalValue)
    .enter()
    .append("line")
    .attr("class", "critical-line")
    .attr("x1", (d: number) => scales.xScale(d))
    .attr("x2", (d: number) => scales.xScale(d))
    .attr("y1", scales.yScale(0))
    .attr("y2", scales.yScale(0.5))
    .attr("stroke", "var(--text-primary)")
    .attr("stroke-dasharray", "5,5");
}

export function CriticalLine(props: {
  criticalValue: number[];
  scales: Scales;
}) {
  return svg.g({
    hook: {
      insert: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawCriticalLine(g, props.criticalValue, props.scales);
      },
      update: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawCriticalLine(g, props.criticalValue, props.scales);
      },
    },
  });
}

function drawType1ErrorArea(
  container: any,
  data: DistributionPoint[],
  criticalValue: number[],
  filterFn: CriticalAreaFn,
  scales: Scales,
): void {
  if (!data) return;
  const curriedFilterFn = (d: DistributionPoint) => filterFn(d, criticalValue);

  const type1ErrorArea = data.map((d) => {
    if (curriedFilterFn(d)) {
      return { x: d.x, y: d.y };
    } else {
      return { x: d.x, y: 0 };
    }
  });

  if (type1ErrorArea.length === 0) return;

  type1ErrorArea.push({ x: type1ErrorArea[0]!.x, y: 0 });
  const lastPoint = type1ErrorArea.at(-1);
  if (lastPoint) {
    type1ErrorArea.unshift({ x: lastPoint.x, y: 0 });
  }
  type1ErrorArea.unshift({ x: type1ErrorArea[0]!.x, y: 0 });

  container.selectAll(".type1-error").remove();

  const line = d3
    .line<DistributionPoint>()
    .x((d) => scales.xScale(d.x))
    .y((d) => scales.yScale(d.y));

  container
    .append("path")
    .datum(type1ErrorArea)
    .attr("class", "type1-error")
    .attr("d", line)
    .attr("fill", "var(--lavender)")
    .attr("opacity", 0.24);
}

export function Type1ErrorArea(props: {
  data: DistributionPoint[];
  criticalValue: number[];
  filterFn: CriticalAreaFn;
  scales: Scales;
}) {
  return svg.g({
    hook: {
      insert: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawType1ErrorArea(g, props.data, props.criticalValue, props.filterFn, props.scales);
      },
      update: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawType1ErrorArea(g, props.data, props.criticalValue, props.filterFn, props.scales);
      },
    },
  });
}

function drawType2ErrorArea(
  container: any,
  data: DistributionPoint[],
  criticalValue: number[],
  filterFn: CriticalAreaFn,
  scales: Scales,
): void {
  if (!data) return;
  const curriedFilterFn = (d: DistributionPoint) => filterFn(d, criticalValue);

  const type2ErrorArea = data.map((d) => {
    // Type II Error: when H1 is true, fail to reject H0 (acceptance region)
    // This is the opposite of the rejection region defined by criticalAreaFn
    if (!curriedFilterFn(d)) {
      return { x: d.x, y: d.y };
    } else {
      return { x: d.x, y: 0 };
    }
  });

  if (type2ErrorArea.length === 0) return;

  type2ErrorArea.push({ x: type2ErrorArea[0]!.x, y: 0 });
  const lastPoint = type2ErrorArea.at(-1);
  if (lastPoint) {
    type2ErrorArea.unshift({ x: lastPoint.x, y: 0 });
  }
  type2ErrorArea.unshift({ x: type2ErrorArea[0]!.x, y: 0 });

  container.selectAll(".type2-error").remove();

  const line = d3
    .line<DistributionPoint>()
    .x((d) => scales.xScale(d.x))
    .y((d) => scales.yScale(d.y));

  container
    .append("path")
    .datum(type2ErrorArea)
    .attr("class", "type2-error")
    .attr("d", line)
    .attr("fill", "var(--danger)")
    .attr("opacity", 0.24);
}

export function Type2ErrorArea(props: {
  data: DistributionPoint[];
  criticalValue: number[];
  filterFn: CriticalAreaFn;
  scales: Scales;
}) {
  return svg.g({
    hook: {
      insert: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawType2ErrorArea(g, props.data, props.criticalValue, props.filterFn, props.scales);
      },
      update: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawType2ErrorArea(g, props.data, props.criticalValue, props.filterFn, props.scales);
      },
    },
  });
}

function drawHypothesisText(container: any, text0: string, text1: string): void {
  const prevText0 = container.select(".hypothesis-text0");
  const prevText1 = container.select(".hypothesis-text1");
  if (prevText0.node() && prevText1.node()) {
    if (prevText0.text() === text0 && prevText1.text() === text1) {
      return;
    }
  }

  container.selectAll(".hypothesis-text").remove();
  container
    .append("text")
    .attr("class", "hypothesis-text hypothesis-text0")
    .attr("x", 10)
    .attr("y", 20)
    .attr("text-anchor", "start")
    .style("font-weight", "bold")
    .attr("font-size", "14px")
    .text(text0);

  container
    .append("text")
    .attr("class", "hypothesis-text hypothesis-text1")
    .attr("x", 10)
    .attr("y", 40)
    .attr("text-anchor", "start")
    .style("font-weight", "bold")
    .attr("font-size", "14px")
    .text(text1);
}

export function HypothesisText(props: { text0: string; text1: string }) {
  return svg.g({
    hook: {
      insert: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawHypothesisText(g, props.text0, props.text1);
      },
      update: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawHypothesisText(g, props.text0, props.text1);
      },
    },
  });
}
