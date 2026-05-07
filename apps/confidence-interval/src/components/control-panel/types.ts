import type { Stream } from "xstream";
import type { VNode } from "@cycle/dom";
import type { Reducer } from "@cycle/state";

export interface ControlPanelState {
  sampleSize: number;
  populationSD: number;
  confidenceLevel: number;
  coverage: number;
  collapsed: boolean;
}

export interface ControlPanelSources {
  DOM: any;
  state: { stream: Stream<ControlPanelState> };
}

export interface ControlPanelSinks {
  DOM: Stream<VNode>;
}

export interface ControlPanelProps {
  sampleSize: number;
  populationSD: number;
  confidenceLevel: number;
  coverage: number;
  collapsed: boolean;
}
