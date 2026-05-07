import type { Sources, Sinks, AppState } from './types';
import type { ParamsState } from '../ControlPanel/types';
import { intent } from './intent';
import { model } from './model';
import { view } from './view';
import ControlPanel from '../ControlPanel';
import Chart from '../Chart';
import isolate from '@cycle/isolate';
import xs, { Stream } from 'xstream';
import type { Reducer } from '@cycle/state';

export default function TypeErrorsApp(sources: Sources): Sinks {
  const actions = intent(sources);
  const { reducer$: appReducer$ } = model(actions, sources);

  // Wire child components with isolate
  const controlPanelSinks = isolate(ControlPanel, 'params')({
    DOM: sources.DOM,
    state: sources.state
  });

  // Create props stream for Chart from computed state
  const chartProps$ = sources.state.stream
    .map(state => ({
      scales: state.computed.scales,
      nullDistribution: state.computed.nullDistribution,
      trueDistribution: state.computed.trueDistribution,
      criticalValue: state.computed.criticalValue,
      criticalAreaFn: state.computed.criticalAreaFn,
      hypothesisText: state.computed.hypothesisText,
      width: state.config.width,
      height: state.config.height
    }));

  const chartSinks = Chart({
    props: chartProps$
  });

  // Merge child reducers into parent reducer
  // Child reducer is already wrapped by isolate to update only its portion
  const paramsReducer$ = (controlPanelSinks.state as Stream<Reducer<AppState>>)
    .map((childReducer): Reducer<AppState> => {
      return (prev: AppState | undefined) => {
        if (!prev) return prev;
        const result = childReducer(prev);
        // Child reducer returns undefined to delete, or updated state
        if (!result) return prev;
        return result;
      };
    });

  const reducer$ = xs.merge(
    appReducer$,
    paramsReducer$
  );

  // Pass child DOM streams to view
  const vdom$ = view(controlPanelSinks.DOM, chartSinks.DOM, sources.state.stream);

  return {
    DOM: vdom$,
    state: reducer$
  };
}
