import xs, { type Stream } from "xstream";
import { runExample } from "../../simulation/engine";
import { moduleConfig } from "./module-config";
import type { Actions, ControlValue, ExampleConfig, State } from "./types";

function getExample(exampleId: string): ExampleConfig {
  return (
    moduleConfig.examples.find((example) => example.id === exampleId) ??
    moduleConfig.examples[0]
  );
}

export function createDefaultControls(example: ExampleConfig): Record<string, ControlValue> {
  return Object.fromEntries(
    example.controls.map((control) => [control.id, control.defaultValue])
  );
}

export function createState(
  exampleId = moduleConfig.examples[0].id,
  controls?: Record<string, ControlValue>,
  seed = 510
): State {
  const activeExample = getExample(exampleId);
  const mergedControls = {
    ...createDefaultControls(activeExample),
    ...(controls ?? {})
  };

  return {
    config: moduleConfig,
    activeExample,
    controls: mergedControls,
    seed,
    result: runExample(activeExample, mergedControls, seed, moduleConfig.data)
  };
}

type Reducer = (state: State) => State;

export function model(actions: Actions): Stream<State> {
  const selectReducer$ = actions.selectExample$.map(
    (exampleId): Reducer =>
      (state) =>
        createState(exampleId, undefined, state.seed + 1)
  );

  const updateReducer$ = actions.updateControl$.map(
    ({ id, value }): Reducer =>
      (state) =>
        createState(
          state.activeExample.id,
          {
            ...state.controls,
            [id]: value
          },
          state.seed
        )
  );

  const runReducer$ = actions.runSimulation$.map(
    (seed): Reducer =>
      (state) =>
        createState(state.activeExample.id, state.controls, seed)
  );

  return xs
    .merge(selectReducer$, updateReducer$, runReducer$)
    .fold((state, reducer) => reducer(state), createState());
}
