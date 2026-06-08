import type { Sources, AppState } from './types';
import xs, { Stream } from 'xstream';
import type { Reducer } from '@cycle/state';
import * as d3 from 'd3';
import jStat from 'jstat';

// Constants for chart margins
const marginTop = 20;
const marginRight = 10;
const marginBottom = 30;
const marginLeft = 40;

// Type for params from child component
interface Params {
  alpha: number;
  nullMean: number;
  trueMean: number;
  stdDev: number;
}

type TestType = 'left-tailed' | 'right-tailed' | 'two-tailed';

// Reuse computation functions from the old model
function normalPDF(x: number, mean: number, stdDev: number): number {
  return (1 / (stdDev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * ((x - mean) / stdDev) ** 2);
}

function normalCDF(x: number, mean: number, stdDev: number): number {
  const z = (x - mean) / (stdDev * Math.sqrt(2));
  return 0.5 * (1 + erf(z));
}

function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const t = 1 / (1 + p * absX);
  const y =
    1 -
    (((((a5 * t + a4) * t + a3) * t + a2) * t + a1) *
      t *
      Math.exp(-absX * absX));
  return sign * y;
}

function generateDistribution(mean: number, stdDev: number): Array<{ x: number; y: number }> {
  return d3.range(-5, 10, 0.05).map((x) => ({
    x,
    y: normalPDF(x, mean, stdDev),
  }));
}

function createScales(
  width: number,
  height: number
): { xScale: d3.ScaleLinear<number, number>; yScale: d3.ScaleLinear<number, number> } {
  const chartWidth = width - marginLeft - marginRight;
  const chartHeight = height - marginTop - marginBottom;
  const xScale = d3.scaleLinear().domain([-5, 10]).range([0, chartWidth]);
  const yScale = d3.scaleLinear().domain([0, 0.5]).range([chartHeight, 0]);
  return { xScale, yScale };
}

function computeCriticalValues(
  alpha: number,
  nullMean: number,
  stdDev: number,
  testType: TestType
): number[] {
  const pValues =
    testType === 'right-tailed'
      ? [1 - alpha]
      : testType === 'left-tailed'
      ? [alpha]
      : [alpha / 2, 1 - alpha / 2];

  return pValues.map((p) => jStat.normal.inv(p, nullMean, stdDev));
}

function createCriticalAreaFn(
  testType: TestType
): (d: { x: number; y: number }, c: number[]) => boolean {
  return (d: { x: number; y: number }, c: number[]) => {
    if (testType === 'right-tailed') {
      return d.x > (c[0] ?? 0);
    } else if (testType === 'left-tailed') {
      return d.x < (c[0] ?? 0);
    } else {
      // two-tailed
      return d.x < (c[0] ?? 0) || d.x > (c[1] ?? 0);
    }
  };
}

function createHypothesisText(
  nullMean: number,
  testType: TestType
): { H0Text: string; H1Text: string } {
  const H0Text = `H₀: μ = ${nullMean}`;
  const H1Text =
    testType === 'right-tailed'
      ? `Hₐ: μ > ${nullMean}`
      : testType === 'left-tailed'
      ? `Hₐ: μ < ${nullMean}`
      : `Hₐ: μ ≠ ${nullMean}`;

  return { H0Text, H1Text };
}

function computeTypeTwoErrorRate(
  criticalValue: number[],
  trueMean: number,
  stdDev: number,
  testType: TestType
): number {
  if (testType === 'right-tailed') {
    return normalCDF(criticalValue[0] ?? 0, trueMean, stdDev);
  }

  if (testType === 'left-tailed') {
    return 1 - normalCDF(criticalValue[0] ?? 0, trueMean, stdDev);
  }

  const left = criticalValue[0] ?? 0;
  const right = criticalValue[1] ?? 0;
  return normalCDF(right, trueMean, stdDev) - normalCDF(left, trueMean, stdDev);
}

export function model(
  actions: any,
  sources: Sources
): { reducer$: Stream<Reducer<AppState>>; state$: Stream<AppState> } {
  // Extract config from CONFIG source
  const config$ = sources.CONFIG.take(1);

  // Default reducer to initialize state
  const defaultReducer$ = config$.map((config): Reducer<AppState> => {
    return (): AppState => {
      const params: Params = {
        alpha: 0.05,
        nullMean: 0,
        trueMean: 1,
        stdDev: 1,
      };

      const testType = config.testType as TestType;
      const criticalValue = computeCriticalValues(
        params.alpha,
        params.nullMean,
        params.stdDev,
        testType,
      );
      const typeTwoErrorRate = computeTypeTwoErrorRate(
        criticalValue,
        params.trueMean,
        params.stdDev,
        testType,
      );

      return {
        config: {
          width: config.width,
          height: config.height,
          testType,
        },
        params,
        computed: {
          scales: createScales(config.width, config.height),
          nullDistribution: generateDistribution(params.nullMean, params.stdDev),
          trueDistribution: generateDistribution(params.trueMean, params.stdDev),
          criticalValue,
          criticalAreaFn: createCriticalAreaFn(testType),
          hypothesisText: createHypothesisText(params.nullMean, testType),
          typeOneErrorRate: params.alpha,
          typeTwoErrorRate,
          power: 1 - typeTwoErrorRate,
          effectSize: params.trueMean - params.nullMean,
        },
      };
    };
  });

  // Get state stream to watch for child state changes
  const state$ = sources.state.stream;

  // Watch state stream for child params changes
  // Child reducers update params in state, so we watch state.stream for changes
  let previousParams: Params | null = null;
  const paramsChanged$ = state$
    .filter((state): state is AppState => state !== undefined && state.params !== undefined)
    .map(state => state.params)
    .filter((params): params is Params => {
      // Only emit when params actually change
      if (previousParams === null) {
        previousParams = params;
        return false; // Skip first emission (initial state)
      }
      const changed =
        params.alpha !== previousParams.alpha ||
        params.nullMean !== previousParams.nullMean ||
        params.trueMean !== previousParams.trueMean ||
        params.stdDev !== previousParams.stdDev;
      previousParams = params;
      return changed;
    });

  // Recompute computed state when params change
  // We use paramsChanged$ to trigger computed state recalculation only when params change
  const computedReducer$: Stream<Reducer<AppState>> = paramsChanged$
    .map((params): Reducer<AppState> => {
      return (prev: AppState | undefined): AppState => {
        if (!prev) {
          throw new Error('State should be initialized before computed updates');
        }

        const criticalValue = computeCriticalValues(
          params.alpha,
          params.nullMean,
          params.stdDev,
          prev.config.testType,
        );
        const typeTwoErrorRate = computeTypeTwoErrorRate(
          criticalValue,
          params.trueMean,
          params.stdDev,
          prev.config.testType,
        );

        return {
          ...prev,
          params,
          computed: {
            scales: createScales(prev.config.width, prev.config.height),
            nullDistribution: generateDistribution(params.nullMean, params.stdDev),
            trueDistribution: generateDistribution(params.trueMean, params.stdDev),
            criticalValue,
            criticalAreaFn: createCriticalAreaFn(prev.config.testType),
            hypothesisText: createHypothesisText(params.nullMean, prev.config.testType),
            typeOneErrorRate: params.alpha,
            typeTwoErrorRate,
            power: 1 - typeTwoErrorRate,
            effectSize: params.trueMean - params.nullMean,
          },
        };
      };
    });

  const testType$ = actions.testType$ as Stream<TestType>;
  const testTypeReducer$: Stream<Reducer<AppState>> = testType$.map((testType: TestType): Reducer<AppState> => {
    return (prev: AppState | undefined): AppState => {
      if (!prev) {
        throw new Error('State should be initialized before test type updates');
      }

      const { params } = prev;
      const criticalValue = computeCriticalValues(
        params.alpha,
        params.nullMean,
        params.stdDev,
        testType,
      );
      const typeTwoErrorRate = computeTypeTwoErrorRate(
        criticalValue,
        params.trueMean,
        params.stdDev,
        testType,
      );

      return {
        ...prev,
        config: {
          ...prev.config,
          testType,
        },
        computed: {
          scales: createScales(prev.config.width, prev.config.height),
          nullDistribution: generateDistribution(params.nullMean, params.stdDev),
          trueDistribution: generateDistribution(params.trueMean, params.stdDev),
          criticalValue,
          criticalAreaFn: createCriticalAreaFn(testType),
          hypothesisText: createHypothesisText(params.nullMean, testType),
          typeOneErrorRate: params.alpha,
          typeTwoErrorRate,
          power: 1 - typeTwoErrorRate,
          effectSize: params.trueMean - params.nullMean,
        },
      };
    };
  });

  // Merge all reducers
  const reducer$ = xs.merge(defaultReducer$, computedReducer$, testTypeReducer$);

  return { reducer$, state$ };
}
