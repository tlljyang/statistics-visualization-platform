import { Stream } from 'xstream';
import type { VNode } from '@cycle/dom';

export interface DistributionPoint {
  x: number;
  y: number;
}

export interface Scales {
  xScale: d3.ScaleLinear<number, number>;
  yScale: d3.ScaleLinear<number, number>;
}

export type CriticalAreaFn = (d: DistributionPoint, c: number[]) => boolean;

export interface HypothesisText {
  H0Text: string;
  H1Text: string;
}

export interface ChartProps {
  scales: Scales;
  nullDistribution: DistributionPoint[];
  trueDistribution: DistributionPoint[];
  criticalValue: number[];
  criticalAreaFn: CriticalAreaFn;
  hypothesisText: HypothesisText;
  width: number;
  height: number;
}

export interface Sources {
  props: Stream<ChartProps>;
}

export interface Sinks {
  DOM: Stream<VNode>;
}
