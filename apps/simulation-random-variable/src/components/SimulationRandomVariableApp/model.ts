import xs, { type Stream } from "xstream";
import { localizeModuleConfig, localizeSimulationResult, templateCopy } from "@stats-viz/shared/i18n";
import type { Language } from "@stats-viz/shared/language";
import { runExample } from "../../simulation/engine";
import { moduleConfig } from "./module-config";
import type { Actions, ControlValue, ExampleConfig, ModuleConfig, State } from "./types";

function getLocalizedConfig(language: Language): ModuleConfig {
  return localizeModuleConfig(moduleConfig, language);
}

function getExample(exampleId: string, config: ModuleConfig): ExampleConfig {
  return (
    config.examples.find((example) => example.id === exampleId) ??
    config.examples[0]
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
  seed = 510,
  language: Language = "zh"
): State {
  const config = getLocalizedConfig(language);
  const activeExample = getExample(exampleId, config);
  const mergedControls = {
    ...createDefaultControls(activeExample),
    ...(controls ?? {})
  };

  return {
    language,
    copy: templateCopy[language],
    config,
    activeExample,
    controls: mergedControls,
    seed,
    result: localizeSimulationResult(runExample(activeExample, mergedControls, seed, moduleConfig.data), language)
  };
}

type Reducer = (state: State) => State;

function clampSampleSize(value: number, example: ExampleConfig): number {
  const sampleSizeControl = example.controls.find((control) => control.id === "sampleSize");
  const min = sampleSizeControl?.min ?? 1;
  const max = sampleSizeControl?.max ?? Number.POSITIVE_INFINITY;

  return Math.min(max, Math.max(min, Math.round(value)));
}

export function model(actions: Actions, language$: Stream<Language>): Stream<State> {
  const languageReducer$ = language$.map(
    (language): Reducer =>
      (state) =>
        createState(state.activeExample.id, state.controls, state.seed, language)
  );

  const selectReducer$ = actions.selectExample$.map(
    (exampleId): Reducer =>
      (state) =>
        createState(exampleId, undefined, state.seed + 1, state.language)
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
          state.seed,
          state.language
        )
  );

  const runReducer$ = actions.runSimulation$.map(
    (seed): Reducer =>
      (state) =>
        createState(state.activeExample.id, state.controls, seed, state.language)
  );

  const addSamplesReducer$ = actions.addSamples$.map(
    (delta): Reducer =>
      (state) => {
        const currentSize = Number(state.controls.sampleSize ?? 0);
        const nextSampleSize = clampSampleSize(currentSize + delta, state.activeExample);

        return createState(
          state.activeExample.id,
          {
            ...state.controls,
            sampleSize: nextSampleSize
          },
          Date.now(),
          state.language
        );
      }
  );

  return xs
    .merge(languageReducer$, selectReducer$, updateReducer$, addSamplesReducer$, runReducer$)
    .fold((state, reducer) => reducer(state), createState(undefined, undefined, Date.now()));
}
