import type { VNode } from "@cycle/dom";
import type { Stream } from "xstream";
import { withState } from "@cycle/state";
import { languageStream } from "../../../../shared/language";
import intent from "./intent";
import model from "./model";
import view from "./view";
import type { State, Sources, Sinks } from "./types";

// The actual component that works with @cycle/state
function ConfidenceInterval(sources: any): any {
  const actions = intent(sources);
  const reducer$ = model(actions, languageStream());
  const state$ = sources.state.stream;
  const vdom$ = view(state$);

  return {
    DOM: vdom$,
    state: reducer$,
  };
}

export default ConfidenceInterval;
export { ConfidenceInterval, intent, model, view };
export type { State, Sources, Sinks };

// Wrapped component with @cycle/state
export const ConfidenceIntervalWithState = withState(ConfidenceInterval);


