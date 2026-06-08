import * as d3 from "d3";
import type { Sample, Scales } from "../types";

// Render data for visualization
export interface RenderData {
  x1: number;
  x2: number;
  meanX: number;
  y: number;
  containsMean: boolean;
}

export function createRenderData(samples: Sample[], scales: Scales): RenderData[] {
  return samples.map((sample, index) => {
    const x1 = scales.xScale(sample.lower);
    const x2 = scales.xScale(sample.upper);
    const meanX = scales.xScale(sample.mean);
    const y = scales.yScale(index + 0.5);
    return {
      x1,
      x2,
      meanX,
      y,
      containsMean: sample.contains,
    };
  });
}

// D3.js rendering functions for Confidence Intervals
export function drawCIs(container: any, data: RenderData[]): void {
  const ciLines = container.selectAll(".ci-group").data(data);

  const ciEnter = ciLines.enter().append("g").attr("class", "ci-group");

  ciEnter
    .append("line")
    .attr("class", "ci-line")
    .attr("y1", (d: RenderData) => d.y)
    .attr("y2", (d: RenderData) => d.y)
    .attr("x1", (d: RenderData) => d.x1)
    .attr("x2", (d: RenderData) => d.x2)
    .style("stroke", (d: RenderData) => (d.containsMean ? "var(--sage)" : "var(--danger)"))
    .style("stroke-width", 2)
    .style("stroke-linecap", "round");

  ciEnter
    .append("circle")
    .attr("class", "sample-mean")
    .attr("cx", (d: RenderData) => d.meanX)
    .attr("cy", (d: RenderData) => d.y)
    .attr("r", 5.5)
    .style("fill", (d: RenderData) => (d.containsMean ? "var(--deep-teal)" : "var(--danger)"))
    .style("stroke", "var(--chart-bg)")
    .style("stroke-width", 2);

  // Update existing elements
  ciLines
    .select(".ci-line")
    .transition()
    .duration(500)
    .attr("y1", (d: RenderData) => d.y)
    .attr("y2", (d: RenderData) => d.y)
    .attr("x1", (d: RenderData) => d.x1)
    .attr("x2", (d: RenderData) => d.x2)
    .style("stroke", (d: RenderData) => (d.containsMean ? "var(--sage)" : "var(--danger)"))
    .style("stroke-width", 2)
    .style("stroke-linecap", "round");

  ciLines
    .select(".sample-mean")
    .transition()
    .duration(500)
    .attr("cx", (d: RenderData) => d.meanX)
    .attr("cy", (d: RenderData) => d.y)
    .style("fill", (d: RenderData) => (d.containsMean ? "var(--deep-teal)" : "var(--danger)"));

  const ciExit = ciLines.exit();
  ciExit.select(".ci-line").remove();
  ciExit.select(".sample-mean").remove();
  ciExit.remove();
}

// D3.js rendering for True Mean line
export function drawTrueMean(container: any, x: number, y: number, populationMean: number): void {
  container.selectAll(".true-mean").remove();
  container.selectAll(".true-mean-text").remove();

  container
    .append("line")
    .attr("class", "true-mean")
    .attr("stroke", "var(--chart-blue)")
    .attr("stroke-width", 1.8)
    .attr("stroke-dasharray", "6,7")
    .attr("x1", x)
    .attr("y1", 0)
    .attr("x2", x)
    .attr("y2", y);

  container
    .append("text")
    .attr("class", "true-mean-text")
    .attr("x", x)
    .attr("y", 15)
    .attr("fill", "var(--chart-blue)")
    .text(`True Mean (μ = ${populationMean})`);
}
