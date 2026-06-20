import { describe, it, expect } from 'vitest';
import xs from 'xstream';
import model from '../../../../src/components/confidence-interval/model';
import type { Actions } from '../../../../src/components/confidence-interval/types';

describe('ConfidenceInterval Model', () => {
  it('should return a stream of reducers', () => {
    const actions: Actions = {
      sampleSize$: xs.never(),
      populationSD$: xs.never(),
      confidenceLevel$: xs.never(),
      addSampleClick$: xs.never(),
      addMultipleClick$: xs.never(),
      resetClick$: xs.never(),
      toggleSidebar$: xs.never(),
    };

    const reducer$ = model(actions);
    expect(reducer$).toBeTypeOf('object');
    expect(reducer$.addListener).toBeTypeOf('function');
  });

  it('should initialize state correctly with defaultReducer', () => {
    const actions: Actions = {
      sampleSize$: xs.never(),
      populationSD$: xs.never(),
      confidenceLevel$: xs.never(),
      addSampleClick$: xs.never(),
      addMultipleClick$: xs.never(),
      resetClick$: xs.never(),
      toggleSidebar$: xs.never(),
    };

    const reducer$ = model(actions);

    return new Promise<void>((resolve, reject) => {
      let receivedReducer = false;

      const timeout = setTimeout(() => {
        if (receivedReducer) {
          resolve();
        } else {
          reject(new Error('No reducer emitted'));
        }
      }, 100);

      reducer$.addListener({
        next: (reducer) => {
          if (!receivedReducer) {
            receivedReducer = true;
          const state = reducer(undefined);
          expect(state).toHaveProperty('sampleSize', 10);
          expect(state).toHaveProperty('populationSD', 2);
          expect(state).toHaveProperty('confidenceLevel', 0.95);
          expect(state.samples).toHaveLength(0);
          expect(state).toHaveProperty('coverage', 0);
          expect(state).toHaveProperty('collapsed', false);
          clearTimeout(timeout);
          resolve();
          }
        },
        error: reject
      });
    });
  });

  it('should preserve existing state', () => {
    const actions: Actions = {
      sampleSize$: xs.never(),
      populationSD$: xs.never(),
      confidenceLevel$: xs.never(),
      addSampleClick$: xs.never(),
      addMultipleClick$: xs.never(),
      resetClick$: xs.never(),
      toggleSidebar$: xs.never(),
    };

    const reducer$ = model(actions);

    return new Promise<void>((resolve, reject) => {
      let receivedReducer = false;

      const timeout = setTimeout(() => {
        if (receivedReducer) {
          resolve();
        } else {
          reject(new Error('No reducer emitted'));
        }
      }, 100);

      reducer$.addListener({
        next: (reducer) => {
          if (!receivedReducer) {
            receivedReducer = true;
          const existingState = {
            language: "zh" as const,
            sampleSize: 20,
            populationSD: 3,
            confidenceLevel: 0.9,
            samples: [],
            coverage: 0.5,
            scales: {} as any,
            config: {
              width: 600,
              height: 400,
              margin: { top: 20, right: 30, bottom: 30, left: 40 },
              populationMean: 10,
            },
            collapsed: true,
            seed: 42,
          };
          const newState = reducer(existingState);
          expect(newState).toBe(existingState);
          clearTimeout(timeout);
          resolve();
          }
        },
        error: reject
      });
    });
  });
});
