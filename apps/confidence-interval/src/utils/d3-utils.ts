import * as d3 from "d3";
import type { ScaleLinear } from "d3";
import type { Sample, Scales, Config } from "../components/confidence-interval/types";

export function createScales(
  width: number,
  height: number,
  margin: { top: number; right: number; bottom: number; left: number },
  samples: Sample[],
): Scales {
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const xScale = d3
    .scaleLinear()
    .domain([5, 15])
    .range([0, chartWidth]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([chartHeight, 0]);

  if (samples && samples.length > 0) {
    yScale.domain([0, samples.length]);

    const maxValue = d3.max(samples, (d) => d.upper)! * 1.1;
    const minValue = d3.min(samples, (d) => d.lower)! * 0.9;
    xScale.domain([Math.min(minValue, 5), Math.max(maxValue, 15)]);
  }

  return { xScale, yScale };
}
