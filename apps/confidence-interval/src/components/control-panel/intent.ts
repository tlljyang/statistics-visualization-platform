import { $el } from "../../utils/dom-helper";
import type { ControlPanelSources } from "./types";
import type { Stream } from "xstream";

export interface ControlPanelActions {
  sampleSize$: Stream<number>;
  populationSD$: Stream<number>;
  confidenceLevel$: Stream<number>;
  addSampleClick$: Stream<any>;
  addMultipleClick$: Stream<any>;
  resetClick$: Stream<any>;
  toggleSidebar$: Stream<any>;
}

export default function intent(sources: ControlPanelSources): ControlPanelActions {
  const sampleSize$ = $el(sources.DOM, "#sampleSize")
    .events("input")
    .map((ev: Event) => Number((ev.target as HTMLInputElement).value));

  const populationSD$ = $el(sources.DOM, "#populationSD")
    .events("input")
    .map((ev: Event) => Number((ev.target as HTMLInputElement).value));

  const confidenceLevel$ = $el(sources.DOM, "#confidenceLevel")
    .events("change")
    .map((ev: Event) => Number((ev.target as HTMLSelectElement).value));

  const addSampleClick$ = $el(sources.DOM, "#generateSample").events("click");
  const addMultipleClick$ = $el(sources.DOM, "#generateMultiple").events("click");
  const resetClick$ = $el(sources.DOM, "#reset").events("click");
  const toggleSidebar$ = $el(sources.DOM, "#toggleSidebar").events("click");

  return {
    sampleSize$,
    populationSD$,
    confidenceLevel$,
    addSampleClick$,
    addMultipleClick$,
    resetClick$,
    toggleSidebar$,
  };
}
