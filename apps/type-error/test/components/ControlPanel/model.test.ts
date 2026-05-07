import xs from 'xstream';
import fromDiagram from 'xstream/extra/fromDiagram';
import { expect } from 'chai';
import { model } from '../../../src/components/ControlPanel/model';
import type { Actions, ParamsState } from '../../../src/components/ControlPanel/types';

describe('ControlPanel model', () => {
  it('should initialize with defaultReducer', (done) => {
    const actions: Actions = {
      alpha$: xs.never() as any,
      nullMean$: xs.never() as any,
      trueMean$: xs.never() as any,
      stdDev$: xs.never() as any,
    };

    const { reducer$ } = model(actions);

    // Apply the first reducer (defaultReducer) as it arrives
    reducer$.take(1).addListener({
      next: (reducer) => {
        const initialState = reducer(undefined);
        expect(initialState).to.deep.equal({
          alpha: 0.05,
          nullMean: 0,
          trueMean: 1,
          stdDev: 1,
        });
        done();
      },
      error: done,
    });
  });

  it('should update alpha from actions', (done) => {
    const actions: Actions = {
      alpha$: fromDiagram('a-b-|').mapTo(0.08),
      nullMean$: xs.never() as any,
      trueMean$: xs.never() as any,
      stdDev$: xs.never() as any,
    };

    const { reducer$ } = model(actions);

    // Apply reducers as they arrive
    let state: ParamsState | undefined;
    let reducerCount = 0;

    reducer$.addListener({
      next: (reducer) => {
        if (reducerCount === 0) {
          // First reducer: initialize
          state = reducer(undefined);
          expect(state!.alpha).to.equal(0.05);
        } else if (reducerCount === 1) {
          // Second reducer: update alpha
          state = reducer(state);
          expect(state!.alpha).to.equal(0.08);
          expect(state!.nullMean).to.equal(0);
          expect(state!.trueMean).to.equal(1);
          expect(state!.stdDev).to.equal(1);
          done();
        }
        reducerCount++;
      },
      error: done,
    });
  });

  it('should update multiple params simultaneously', (done) => {
    const actions: Actions = {
      alpha$: fromDiagram('a-|').mapTo(0.01),
      nullMean$: fromDiagram('b-|').mapTo(1),
      trueMean$: fromDiagram('c-|').mapTo(2),
      stdDev$: fromDiagram('d-|').mapTo(0.5),
    };

    const { reducer$ } = model(actions);

    // Apply reducers as they arrive
    let state: ParamsState | undefined;
    let updateCount = 0;

    reducer$.addListener({
      next: (reducer) => {
        if (updateCount === 0) {
          // First reducer: initialize
          state = reducer(undefined);
        } else {
          // Subsequent reducers: update state
          state = reducer(state);
        }

        // After receiving all updates (1 initial + 4 params = 5 reducers)
        if (updateCount === 4) {
          expect(state!.alpha).to.equal(0.01);
          expect(state!.nullMean).to.equal(1);
          expect(state!.trueMean).to.equal(2);
          expect(state!.stdDev).to.equal(0.5);
          done();
        }
        updateCount++;
      },
      error: done,
    });
  });
});
