import xs, { type Stream } from "xstream";
import dropRepeats from "xstream/extra/dropRepeats";
import * as d3 from "d3";
import type { Language } from "../../../../shared/language";
import { createScales } from "../../utils/d3-utils";
import type { Actions, Sample, Scales, Config, State } from "./types";

function createRandom(seed: number): () => number {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createInitialState(language: Language = "zh"): State {
  const config: Config = {
    width: 760,
    height: 360,
    margin: { top: 24, right: 32, bottom: 56, left: 56 },
    populationMean: 10,
  };

  const scales = createScales(
    config.width,
    config.height,
    config.margin,
    [],
  );

  return {
    language,
    sampleSize: 10,
    populationSD: 2,
    confidenceLevel: 0.95,
    samples: [],
    coverage: 0,
    scales,
    config,
    collapsed: false,
    seed: 42,
  };
}

// Utility functions
// The default RNG keeps the 3-argument call sites (tests, direct callers)
// working; the model always threads its own seeded RNG so coverage stays
// reproducible across reloads.
export function generateSample(
  mean: number,
  stddev: number,
  n: number,
  rng: () => number = Math.random
): number[] {
  const samples: number[] = [];
  for (let i = 0; i < n; i++) {
    const u1 = Math.max(rng(), Number.EPSILON);
    const u2 = rng();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    samples.push(z * stddev + mean);
  }
  return samples;
}

export function zScore(confidenceLevel: number): number {
  if (confidenceLevel === 0.95) return 1.96;
  if (confidenceLevel === 0.99) return 2.5758;
  if (confidenceLevel === 0.9) return 1.6449;
  if (confidenceLevel === 0.8) return 1.2816;
  // Unsupported levels should never reach here from the UI; warn loudly
  // instead of silently degrading to the 95% multiplier.
  if (typeof console !== "undefined") {
    console.warn(
      `zScore: unsupported confidence level ${confidenceLevel}, falling back to 1.96 (95%).`
    );
  }
  return 1.96;
}

export function ci(
  samples: number[],
  confidenceLevel: number,
  populationMean: number,
  stddev: number,
): Sample {
  if (samples.length === 0) {
    return {
      lower: Number.NaN,
      upper: Number.NaN,
      mean: Number.NaN,
      contains: false,
    };
  }
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  const z = zScore(confidenceLevel);
  const margin = z * stddev / Math.sqrt(samples.length);
  const lower = mean - margin;
  const upper = mean + margin;
  return {
    lower,
    upper,
    mean,
    contains: lower <= populationMean && upper >= populationMean,
  };
}

export function calculateCoverage(samples: Sample[]): number {
  const n = samples.length;
  if (!n) return 0;
  const covered = samples.filter((x) => x.contains).length;
  return covered / n;
}

// Model function using @cycle/state pattern
export default function model(
  actions: Actions,
  language$: Stream<Language> = xs.of<Language>("zh")
): Stream<(prevState: State | undefined) => State> {
  const {
    sampleSize$,
    populationSD$,
    confidenceLevel$,
    addSampleClick$,
    addMultipleClick$,
    resetClick$,
    toggleSidebar$,
  } = actions;

  // Default reducer for initialization
  const defaultReducer$ = xs.of((prevState: State | undefined): State => {
    if (prevState !== undefined) {
      return prevState;
    }
    return createInitialState();
  });

  const languageReducer$ = language$.map(
    (language) =>
      (prevState: State | undefined): State => ({
        ...(prevState ?? createInitialState(language)),
        language,
      }),
  );

  // Reducer for adding samples
  const addSampleReducer$ = xs
    .merge(
      addSampleClick$.mapTo(1),
      addMultipleClick$.mapTo(20),
    )
    .map((count) =>
      (prevState: State | undefined): State => {
        if (!prevState) {
          return createInitialState();
        }

        // Use current state values if streams haven't emitted yet
        const sampleSize = prevState.sampleSize;
        const populationSD = prevState.populationSD;
        const confidenceLevel = prevState.confidenceLevel;
        const rng = createRandom(prevState.seed);

        const { samples, config } = prevState;
        const newSamples: Sample[] = [];

        for (let i = 0; i < count; i++) {
          const arr = generateSample(
            config.populationMean,
            populationSD,
            sampleSize,
            rng,
          );
          const sample = ci(
            arr,
            confidenceLevel,
            config.populationMean,
            populationSD,
          );
          newSamples.push(sample);
        }

        const updatedSamples = [...samples, ...newSamples];
        const coverage = calculateCoverage(updatedSamples);
        const scales = createScales(
          config.width,
          config.height,
          config.margin,
          updatedSamples,
        );

        return {
          ...prevState,
          samples: updatedSamples,
          coverage,
          scales,
          seed: prevState.seed + count,
        };
      },
    );

  // Reducer for updating sampleSize
  const updateSampleSizeReducer$ = sampleSize$.map(
    (sampleSize) =>
      (prevState: State | undefined): State => {
        if (!prevState) {
          return createInitialState();
        }
        return {
          ...prevState,
          sampleSize,
          samples: [],
          coverage: 0,
          scales: createScales(prevState.config.width, prevState.config.height, prevState.config.margin, []),
        };
      },
  );

  // Reducer for updating populationSD
  const updatePopulationSDReducer$ = populationSD$.map(
    (populationSD) =>
      (prevState: State | undefined): State => {
        if (!prevState) {
          return createInitialState();
        }
        return {
          ...prevState,
          populationSD,
          samples: [],
          coverage: 0,
          scales: createScales(prevState.config.width, prevState.config.height, prevState.config.margin, []),
        };
      },
  );

  // Reducer for updating confidenceLevel
  const updateConfidenceLevelReducer$ = confidenceLevel$.map(
    (confidenceLevel) =>
      (prevState: State | undefined): State => {
        if (!prevState) {
          return createInitialState();
        }
        return {
          ...prevState,
          confidenceLevel,
          samples: [],
          coverage: 0,
          scales: createScales(prevState.config.width, prevState.config.height, prevState.config.margin, []),
        };
      },
  );

  // Reducer for reset button
  const resetReducer$ = resetClick$.mapTo(
    (prevState: State | undefined): State => {
      if (!prevState) {
        return createInitialState();
      }
      const { config } = prevState;
      const scales = createScales(
        config.width,
        config.height,
        config.margin,
        [],
      );

      return {
        ...prevState,
        samples: [],
        coverage: 0,
        scales,
        seed: 42,
      };
    },
  );

  // Reducer for sidebar toggle
  const toggleSidebarReducer$ = toggleSidebar$.map(
    () =>
      (prevState: State | undefined): State => {
        if (!prevState) {
          return createInitialState();
        }
        return {
          ...prevState,
          collapsed: !prevState.collapsed,
        };
      },
  );

  // Merge all reducers
  return xs.merge(
    defaultReducer$,
    languageReducer$,
    addSampleReducer$,
    updateSampleSizeReducer$,
    updatePopulationSDReducer$,
    updateConfidenceLevelReducer$,
    resetReducer$,
    toggleSidebarReducer$,
  );
}
