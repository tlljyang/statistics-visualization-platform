import type { Sinks, Sources } from "./types";
import { languageStream } from "@stats-viz/shared/language";
import { intent } from "./intent";
import { model } from "./model";
import { view } from "./view";

export function App(sources: Sources): Sinks {
  const actions = intent(sources);
  const state$ = model(actions, languageStream());

  return {
    DOM: view(state$)
  };
}

export { App as default };
