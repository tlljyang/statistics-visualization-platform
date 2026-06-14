import { type ScaleLinear } from "d3";
import type { Stream } from "xstream";
import type { DOMSource } from "@cycle/dom";
import type { VNode } from "@cycle/dom";
import type { Language } from "../../../../shared/language";

export interface Sample {
  lower: number;
  upper: number;
  mean: number;
  contains: boolean;
}

export interface Scales {
  xScale: ScaleLinear<number, number>;
  yScale: ScaleLinear<number, number>;
}

export interface Config {
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  populationMean: number;
}

export interface State {
  language: Language;
  sampleSize: number;
  populationSD: number;
  confidenceLevel: number;
  samples: Sample[];
  coverage: number;
  scales: Scales;
  config: Config;
  collapsed: boolean;
}

export interface Actions {
  sampleSize$: Stream<number>;
  populationSD$: Stream<number>;
  confidenceLevel$: Stream<number>;
  addSampleClick$: Stream<{}>;
  addMultipleClick$: Stream<{}>;
  resetClick$: Stream<{}>;
  toggleSidebar$: Stream<{}>;
}

export interface Sources {
  DOM: DOMSource;
  state: { stream: Stream<State> };
}

export interface Sinks {
  DOM: Stream<VNode>;
  state: Stream<(prevState: State | undefined) => State>;
}
