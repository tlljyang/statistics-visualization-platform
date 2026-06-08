import { Stream } from 'xstream';
import type { Reducer, StateSource } from '@cycle/state';
import type { DOMSource, VNode } from '@cycle/dom';

// Import types from existing code
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

export interface AppState {
  config: {
    width: number;
    height: number;
    testType: 'left-tailed' | 'right-tailed' | 'two-tailed';
  };
  params: {
    alpha: number;
    nullMean: number;
    trueMean: number;
    stdDev: number;
  };
    computed: {
      scales: Scales;
      nullDistribution: DistributionPoint[];
      trueDistribution: DistributionPoint[];
      criticalValue: number[];
      criticalAreaFn: CriticalAreaFn;
      hypothesisText: HypothesisText;
      typeOneErrorRate: number;
      typeTwoErrorRate: number;
      power: number;
      effectSize: number;
    };
  }

export interface Sources {
  DOM: DOMSource;
  state: StateSource<AppState>;
  CONFIG: Stream<{ width: number; height: number; testType: string }>;
}

export interface Sinks {
  DOM: Stream<VNode>;
  state: Stream<Reducer<AppState>>;
}

export interface Actions {
  testType$: Stream<'right-tailed' | 'two-tailed'>;
}
