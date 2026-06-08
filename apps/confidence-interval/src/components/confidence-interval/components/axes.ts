import * as d3 from "d3";
import type { ScaleLinear } from "d3";

// X-axis rendering
export function drawXAxis(container: any, scale: ScaleLinear<number, number>): void {
  const existingAxis = container.select("#x-axis");
  if (existingAxis.node()) {
    if (
      existingAxis.attr("data-scale-range") === scale.range().toString() &&
      existingAxis.attr("data-scale-domain") === scale.domain().toString()
    ) {
      return;
    } else {
      existingAxis
        .transition()
        .duration(500)
        .call(d3.axisBottom(scale).ticks(6).tickSizeOuter(0))
        .attr("data-scale-range", scale.range().toString())
        .attr("data-scale-domain", scale.domain().toString());
      styleAxis(existingAxis);
      return;
    }
  }

  const axis = d3.axisBottom(scale).ticks(6).tickSizeOuter(0);
  container
    .append("g")
    .call(axis)
    .attr("id", "x-axis")
    .attr("data-scale-range", scale.range().toString())
    .attr("data-scale-domain", scale.domain().toString())
    .style("user-select", "none")
    .style("pointer-events", "none");
  styleAxis(container.select("#x-axis"));
}

// Y-axis rendering
export function drawYAxis(container: any, scale: ScaleLinear<number, number>): void {
  const existingAxis = container.select("#y-axis");
  if (existingAxis.node()) {
    if (
      existingAxis.attr("data-scale-range") === scale.range().toString() &&
      existingAxis.attr("data-scale-domain") === scale.domain().toString()
    ) {
      return;
    } else {
      existingAxis
        .transition()
        .duration(500)
        .call(d3.axisLeft(scale).ticks(6).tickSizeOuter(0))
        .attr("data-scale-range", scale.range().toString())
        .attr("data-scale-domain", scale.domain().toString());
      styleAxis(existingAxis);
      return;
    }
  }

  const axis = d3.axisLeft(scale).ticks(6).tickSizeOuter(0);
  container
    .append("g")
    .call(axis)
    .attr("id", "y-axis")
    .attr("data-scale-range", scale.range().toString())
    .attr("data-scale-domain", scale.domain().toString())
    .style("user-select", "none")
    .style("pointer-events", "none");
  styleAxis(container.select("#y-axis"));
}

function styleAxis(axis: any): void {
  axis.select(".domain").attr("stroke", "var(--axis)").attr("stroke-width", 1);
  axis.selectAll(".tick line").attr("stroke", "var(--grid)").attr("stroke-width", 1);
  axis.selectAll(".tick text").attr("fill", "var(--text-secondary)").attr("font-size", 12);
}
