import { Stream } from 'xstream';
import type { Reducer, StateSource } from '@cycle/state';
import type { DOMSource, VNode } from '@cycle/dom';
import type { Language } from '@stats-viz/shared/language';

export interface ParamsState {
  alpha: number;
  nullMean: number;
  trueMean: number;
  stdDev: number;
}

export interface Sources {
  DOM: DOMSource;
  state: StateSource<ParamsState>;
  LANGUAGE: Stream<Language>;
}

export interface Sinks {
  DOM: Stream<VNode>;
  state: Stream<Reducer<ParamsState>>;
}

export interface Actions {
  alpha$: Stream<number>;
  nullMean$: Stream<number>;
  trueMean$: Stream<number>;
  stdDev$: Stream<number>;
}
