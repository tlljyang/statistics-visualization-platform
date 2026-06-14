import type { Sources, Sinks } from './types';
import { intent } from './intent';
import { model } from './model';
import { view } from './view';

export default function ControlPanel(sources: Sources): Sinks {
  const actions = intent(sources);
  const { reducer$ } = model(actions);
  const state$ = sources.state.stream;
  const vdom$ = view(state$, sources.LANGUAGE);

  return {
    DOM: vdom$,
    state: reducer$
  };
}
