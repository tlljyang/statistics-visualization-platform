import { describe, it, expect } from 'vitest';
import xs from 'xstream';
import fromDiagram from 'xstream/extra/fromDiagram';
import { model } from '../../../src/components/TypeErrorsApp/model';
import type { Sources, AppState } from '../../../src/components/TypeErrorsApp/types';
import { mockDOMSource } from '@cycle/dom';

describe('TypeErrorsApp model', () => {
  it('should initialize with defaultReducer', () => {
    const sources: Sources = {
      DOM: mockDOMSource({
        '.control-panel input': {}
      }) as any,
      state: {
        stream: xs.never(),
      } as any,
      CONFIG: fromDiagram('a-|').mapTo({
        width: 800,
        height: 400,
        testType: 'right-tailed',
      }),
    };

    const { reducer$ } = model({ testType$: xs.never() }, sources);

    return new Promise<void>((resolve, reject) => {
      reducer$.take(1).addListener({
        next: (reducer) => {
          const initialState = reducer(undefined);
          if (!initialState) {
            reject(new Error('Initial state is undefined'));
            return;
          }
          expect(initialState).toHaveProperty('config');
          expect(initialState).toHaveProperty('params');
          expect(initialState).toHaveProperty('computed');

          expect(initialState.config).toStrictEqual({
            width: 800,
            height: 400,
            testType: 'right-tailed',
          });

          expect(initialState.params).toStrictEqual({
            alpha: 0.05,
            nullMean: 0,
            trueMean: 1,
            stdDev: 1,
          });

          expect(initialState.computed).toHaveProperty('scales');
          expect(initialState.computed).toHaveProperty('nullDistribution');
          expect(initialState.computed).toHaveProperty('trueDistribution');
          expect(initialState.computed).toHaveProperty('criticalValue');
          expect(initialState.computed).toHaveProperty('criticalAreaFn');
          expect(initialState.computed).toHaveProperty('hypothesisText');

          resolve();
        },
        error: reject,
      });
    });
  });

  it('should recompute computed state when params change', () => {
    const initialState: AppState = {
      config: {
        width: 800,
        height: 400,
        testType: 'right-tailed',
      },
      params: {
        alpha: 0.05,
        nullMean: 0,
        trueMean: 1,
        stdDev: 1,
      },
      computed: {
        scales: {} as any,
        nullDistribution: [],
        trueDistribution: [],
        criticalValue: [],
        criticalAreaFn: (() => false) as any,
        hypothesisText: { H0Text: '', H1Text: '' },
      },
    };

    const state$ = xs.merge(
      xs.of(initialState),
      fromDiagram('a-b-|').mapTo({
        ...initialState,
        params: {
          alpha: 0.01,
          nullMean: 1,
          trueMean: 2,
          stdDev: 0.5,
        },
      })
    );

    const sources: Sources = {
      DOM: mockDOMSource({
        '.control-panel input': {}
      }) as any,
      state: {
        stream: state$,
      } as any,
      CONFIG: xs.of({
        width: 800,
        height: 400,
        testType: 'right-tailed',
      }),
    };

    const { reducer$ } = model({ testType$: xs.never() }, sources);

    return new Promise<void>((resolve, reject) => {
      let state: AppState | undefined;
      let reducerCount = 0;

      reducer$.addListener({
        next: (reducer) => {
          if (reducerCount === 0) {
            state = reducer(undefined);
            expect(state!.params.alpha).toBe(0.05);
            expect(state!.params.nullMean).toBe(0);
            expect(state!.params.trueMean).toBe(1);
            expect(state!.params.stdDev).toBe(1);
          } else if (reducerCount === 1) {
            state = reducer(state);
            expect(state!.computed.scales).toBeTypeOf('object');
            expect(state!.computed.scales.xScale).toBeTypeOf('function');
            expect(state!.computed.scales.yScale).toBeTypeOf('function');

            expect(Array.isArray(state!.computed.nullDistribution)).toBe(true);
            expect(state!.computed.nullDistribution.length).toBeGreaterThan(0);

            expect(Array.isArray(state!.computed.trueDistribution)).toBe(true);
            expect(state!.computed.trueDistribution.length).toBeGreaterThan(0);

            expect(Array.isArray(state!.computed.criticalValue)).toBe(true);
            expect(state!.computed.criticalAreaFn).toBeTypeOf('function');

            expect(state!.computed.hypothesisText).toBeTypeOf('object');
            expect(state!.computed.hypothesisText.H0Text).toBeTypeOf('string');
            expect(state!.computed.hypothesisText.H1Text).toBeTypeOf('string');

            resolve();
          }
          reducerCount++;
        },
        error: reject,
      });
    });
  });

  it('should compute scales based on config dimensions', () => {
    const sources: Sources = {
      DOM: mockDOMSource({
        '.control-panel input': {}
      }) as any,
      state: {
        stream: xs.never(),
      } as any,
      CONFIG: fromDiagram('a-|').mapTo({
        width: 1000,
        height: 500,
        testType: 'two-tailed',
      }),
    };

    const { reducer$ } = model({ testType$: xs.never() }, sources);

    return new Promise<void>((resolve, reject) => {
      reducer$.take(1).addListener({
        next: (reducer) => {
          const state = reducer(undefined) as AppState;
          const { xScale, yScale } = state.computed.scales;

          expect(xScale.domain()).toStrictEqual([-5, 10]);
          const xRange = xScale.range();
          expect(xRange[1]! - xRange[0]!).toBe(1000 - 40 - 10);

          expect(yScale.domain()).toStrictEqual([0, 0.5]);
          const yRange = yScale.range();
          expect(yRange[0]! - yRange[1]!).toBe(500 - 20 - 30);

          resolve();
        },
        error: reject,
      });
    });
  });

  it('should compute distributions based on params', () => {
    const sources: Sources = {
      DOM: mockDOMSource({
        '.control-panel input': {}
      }) as any,
      state: {
        stream: xs.never(),
      } as any,
      CONFIG: fromDiagram('a-|').mapTo({
        width: 800,
        height: 400,
        testType: 'right-tailed',
      }),
    };

    const { reducer$ } = model({ testType$: xs.never() }, sources);

    return new Promise<void>((resolve, reject) => {
      reducer$.take(1).addListener({
        next: (reducer) => {
          const state = reducer(undefined) as AppState;
          const { nullDistribution, trueDistribution } = state.computed;

          expect(Array.isArray(nullDistribution)).toBe(true);
          expect(nullDistribution.length).toBeGreaterThan(0);
          const firstNullPoint = nullDistribution[0];
          if (firstNullPoint) {
            expect(firstNullPoint).toHaveProperty('x');
            expect(firstNullPoint).toHaveProperty('y');
            expect(firstNullPoint.x).toBe(-5);
          }

          expect(Array.isArray(trueDistribution)).toBe(true);
          expect(trueDistribution.length).toBeGreaterThan(0);
          const firstTruePoint = trueDistribution[0];
          if (firstTruePoint) {
            expect(firstTruePoint).toHaveProperty('x');
            expect(firstTruePoint).toHaveProperty('y');
          }

          resolve();
        },
        error: reject,
      });
    });
  });

  it('should compute critical values based on test type and params', () => {
    const sources: Sources = {
      DOM: mockDOMSource({
        '.control-panel input': {}
      }) as any,
      state: {
        stream: xs.never(),
      } as any,
      CONFIG: fromDiagram('a-|').mapTo({
        width: 800,
        height: 400,
        testType: 'right-tailed',
      }),
    };

    const { reducer$ } = model({ testType$: xs.never() }, sources);

    return new Promise<void>((resolve, reject) => {
      reducer$.take(1).addListener({
        next: (reducer) => {
          const state = reducer(undefined) as AppState;
          const { criticalValue } = state.computed;

          expect(Array.isArray(criticalValue)).toBe(true);
          expect(criticalValue.length).toBe(1);
          expect(criticalValue[0]).toBeTypeOf('number');

          resolve();
        },
        error: reject,
      });
    });
  });

  it('should generate hypothesis text based on test type', () => {
    const sources: Sources = {
      DOM: mockDOMSource({
        '.control-panel input': {}
      }) as any,
      state: {
        stream: xs.never(),
      } as any,
      CONFIG: fromDiagram('a-|').mapTo({
        width: 800,
        height: 400,
        testType: 'left-tailed',
      }),
    };

    const { reducer$ } = model({ testType$: xs.never() }, sources);

    return new Promise<void>((resolve, reject) => {
      reducer$.take(1).addListener({
        next: (reducer) => {
          const state = reducer(undefined) as AppState;
          const { hypothesisText } = state.computed;

          expect(hypothesisText).toStrictEqual({
            H0Text: 'H₀: μ = 0',
            H1Text: 'Hₐ: μ < 0',
          });

          resolve();
        },
        error: reject,
      });
    });
  });

  it('should handle two-tailed test correctly', () => {
    const sources: Sources = {
      DOM: mockDOMSource({
        '.control-panel input': {}
      }) as any,
      state: {
        stream: xs.never(),
      } as any,
      CONFIG: fromDiagram('a-|').mapTo({
        width: 800,
        height: 400,
        testType: 'two-tailed',
      }),
    };

    const { reducer$ } = model({ testType$: xs.never() }, sources);

    return new Promise<void>((resolve, reject) => {
      reducer$.take(1).addListener({
        next: (reducer) => {
          const state = reducer(undefined) as AppState;
          const { criticalValue, hypothesisText } = state.computed;

          expect(Array.isArray(criticalValue)).toBe(true);
          expect(criticalValue.length).toBe(2);

          expect(hypothesisText).toStrictEqual({
            H0Text: 'H₀: μ = 0',
            H1Text: 'Hₐ: μ ≠ 0',
          });

          resolve();
        },
        error: reject,
      });
    });
  });
});
