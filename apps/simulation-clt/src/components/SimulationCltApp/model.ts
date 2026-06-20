import xs, { type Stream } from "xstream";
import { localizeModuleConfig, localizeSimulationResult, templateCopy } from "@stats-viz/shared/i18n";
import type { Language } from "@stats-viz/shared/language";
import { generateSampleMeans, runExample } from "../../simulation/engine";
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
  sampleMeans: number[] = [],
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
    sampleMeans,
    result: localizeSimulationResult(runExample(activeExample, mergedControls, seed, moduleConfig.data, sampleMeans), language)
  };
}

type Reducer = (state: State) => State;

export function model(actions: Actions, language$: Stream<Language> = xs.of<Language>("zh")): Stream<State> {
  const languageReducer$ = language$.map(
    (language): Reducer =>
      (state) =>
        createState(state.activeExample.id, state.controls, state.seed, state.sampleMeans, language)
  );

  const selectReducer$ = actions.selectExample$.map(
    (exampleId): Reducer =>
      (state) =>
        createState(exampleId, undefined, state.seed + 1, [], state.language)
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
          state.seed + 1,
          [],
          state.language
        )
  );

  const runReducer$ = actions.runSimulation$.map(
    (seed): Reducer =>
      (state) =>
        createState(
          state.activeExample.id,
          state.controls,
          seed,
          generateSampleMeans(state.controls, Math.max(state.sampleMeans.length, 20), seed),
          state.language
        )
  );

  const drawSamplesReducer$ = actions.drawSamples$.map(
    (count): Reducer =>
      (state) => {
        const seed = Date.now();

        return createState(
          state.activeExample.id,
          state.controls,
          seed,
          [
            ...state.sampleMeans,
            ...generateSampleMeans(state.controls, count, seed)
          ],
          state.language
        );
      }
  );

  return xs
    .merge(languageReducer$, selectReducer$, updateReducer$, drawSamplesReducer$, runReducer$)
    .fold((state, reducer) => reducer(state), createState(undefined, undefined, Date.now()));
}
