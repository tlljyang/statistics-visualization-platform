import type { Actions, ParamsState } from './types';
import xs, { Stream } from 'xstream';
import type { Reducer } from '@cycle/state';

export function model(
  actions: Actions
): { reducer$: Stream<Reducer<ParamsState>> } {
  // Default reducer to initialize state
  const defaultReducer$ = xs.of<Reducer<ParamsState>>(() => ({
    alpha: 0.05,
    nullMean: 0,
    trueMean: 1,
    stdDev: 1,
  }));

  // Action reducers for each parameter
  const alphaReducer$ = actions.alpha$.map<Reducer<ParamsState>>(alpha => prev => {
    const newState = { ...prev, alpha } as ParamsState;
    return newState;
  });

  const nullMeanReducer$ = actions.nullMean$.map<Reducer<ParamsState>>(nullMean => prev => {
    const newState = { ...prev, nullMean } as ParamsState;
    return newState;
  });

  const trueMeanReducer$ = actions.trueMean$.map<Reducer<ParamsState>>(trueMean => prev => {
    const newState = { ...prev, trueMean } as ParamsState;
    return newState;
  });

  const stdDevReducer$ = actions.stdDev$.map<Reducer<ParamsState>>(stdDev => prev => {
    const newState = { ...prev, stdDev } as ParamsState;
    return newState;
  });

  // Merge all reducers into single stream
  const reducer$ = xs.merge(
    defaultReducer$,
    alphaReducer$,
    nullMeanReducer$,
    trueMeanReducer$,
    stdDevReducer$
  );

  return { reducer$ };
}
