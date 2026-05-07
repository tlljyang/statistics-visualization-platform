import { svg } from "@cycle/dom";
import * as d3 from "d3";
import type { Scales } from './types';

function drawXAxis(container: any, scale: d3.ScaleLinear<number, number>): void {
  const existingAxis = container.select("#x-axis");
  if (existingAxis.node()) {
    if (
      existingAxis.attr("data-scale-range") === scale.range().toString() &&
      existingAxis.attr("data-scale-domain") === scale.domain().toString()
    ) {
      return;
    } else {
      existingAxis.remove();
    }
  }

  const axis = d3.axisBottom(scale);
  container
    .append("g")
    .call(axis)
    .attr("id", "x-axis")
    .attr("data-scale-range", scale.range())
    .attr("data-scale-domain", scale.domain())
    .style("user-select", "none")
    .style("pointer-events", "none");
}

function drawYAxis(container: any, scale: d3.ScaleLinear<number, number>): void {
  const existingAxis = container.select("#y-axis");
  if (existingAxis.node()) {
    if (
      existingAxis.attr("data-scale-range") === scale.range().toString() &&
      existingAxis.attr("data-scale-domain") === scale.domain().toString()
    ) {
      return;
    } else {
      existingAxis.remove();
    }
  }

  const axis = d3.axisLeft(scale);
  container
    .append("g")
    .call(axis)
    .attr("id", "y-axis")
    .attr("data-scale-range", scale.range())
    .attr("data-scale-domain", scale.domain())
    .style("user-select", "none")
    .style("pointer-events", "none");
}

export function XAxis(props: { scale: d3.ScaleLinear<number, number> }) {
  return svg.g({
    hook: {
      insert: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawXAxis(g, props.scale);
      },
      update: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawXAxis(g, props.scale);
      },
    },
  });
}

export function YAxis(props: { scale: d3.ScaleLinear<number, number> }) {
  return svg.g({
    hook: {
      insert: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawYAxis(g, props.scale);
      },
      update: (vnode: any) => {
        const g = d3.select(vnode.elm);
        drawYAxis(g, props.scale);
      },
    },
  });
}
