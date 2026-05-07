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
        .call(d3.axisBottom(scale))
        .attr("data-scale-range", scale.range().toString())
        .attr("data-scale-domain", scale.domain().toString());
      return;
    }
  }

  const axis = d3.axisBottom(scale);
  container
    .append("g")
    .call(axis)
    .attr("id", "x-axis")
    .attr("data-scale-range", scale.range().toString())
    .attr("data-scale-domain", scale.domain().toString())
    .style("user-select", "none")
    .style("pointer-events", "none");
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
        .call(d3.axisLeft(scale))
        .attr("data-scale-range", scale.range().toString())
        .attr("data-scale-domain", scale.domain().toString());
      return;
    }
  }

  const axis = d3.axisLeft(scale);
  container
    .append("g")
    .call(axis)
    .attr("id", "y-axis")
    .attr("data-scale-range", scale.range().toString())
    .attr("data-scale-domain", scale.domain().toString())
    .style("user-select", "none")
    .style("pointer-events", "none");
}
