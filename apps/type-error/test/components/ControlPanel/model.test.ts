import { describe, it, expect } from 'vitest';
import xs from 'xstream';
import fromDiagram from 'xstream/extra/fromDiagram';
import { model } from '../../../src/components/ControlPanel/model';
import type { Actions, ParamsState } from '../../../src/components/ControlPanel/types';

describe('ControlPanel model', () => {
  it('should initialize with defaultReducer', () => {
    const actions: Actions = {
      alpha$: xs.never() as any,
      nullMean$: xs.never() as any,
      trueMean$: xs.never() as any,
      stdDev$: xs.never() as any,
    };

    const { reducer$ } = model(actions);

    return new Promise<void>((resolve, reject) => {
      reducer$.take(1).addListener({
        next: (reducer) => {
          const initialState = reducer(undefined);
          expect(initialState).toStrictEqual({
            alpha: 0.05,
            nullMean: 0,
            trueMean: 1,
            stdDev: 1,
          });
          resolve();
        },
        error: reject,
      });
    });
  });

  it('should update alpha from actions', () => {
    const actions: Actions = {
      alpha$: fromDiagram('a-b-|').mapTo(0.08),
      nullMean$: xs.never() as any,
      trueMean$: xs.never() as any,
      stdDev$: xs.never() as any,
    };

    const { reducer$ } = model(actions);

    return new Promise<void>((resolve, reject) => {
      let state: ParamsState | undefined;
      let reducerCount = 0;

      reducer$.addListener({
        next: (reducer) => {
          if (reducerCount === 0) {
            state = reducer(undefined);
            expect(state!.alpha).toBe(0.05);
          } else if (reducerCount === 1) {
            state = reducer(state);
            expect(state!.alpha).toBe(0.08);
            expect(state!.nullMean).toBe(0);
            expect(state!.trueMean).toBe(1);
            expect(state!.stdDev).toBe(1);
            resolve();
          }
          reducerCount++;
        },
        error: reject,
      });
    });
  });

  it('should update multiple params simultaneously', () => {
    const actions: Actions = {
      alpha$: fromDiagram('a-|').mapTo(0.01),
      nullMean$: fromDiagram('b-|').mapTo(1),
      trueMean$: fromDiagram('c-|').mapTo(2),
      stdDev$: fromDiagram('d-|').mapTo(0.5),
    };

    const { reducer$ } = model(actions);

    return new Promise<void>((resolve, reject) => {
      let state: ParamsState | undefined;
      let updateCount = 0;

      reducer$.addListener({
        next: (reducer) => {
          if (updateCount === 0) {
            state = reducer(undefined);
          } else {
            state = reducer(state);
          }

          if (updateCount === 4) {
            expect(state!.alpha).toBe(0.01);
            expect(state!.nullMean).toBe(1);
            expect(state!.trueMean).toBe(2);
            expect(state!.stdDev).toBe(0.5);
            resolve();
          }
          updateCount++;
        },
        error: reject,
      });
    });
  });
});
