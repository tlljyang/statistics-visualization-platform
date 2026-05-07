import { expect } from 'chai';
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
    expect(reducer$).to.be.an('object');
    expect(reducer$.addListener).to.be.a('function');
  });

  it('should initialize state correctly with defaultReducer', (done) => {
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
    let receivedReducer = false;

    const timeout = setTimeout(() => {
      if (receivedReducer) {
        done();
      } else {
        done(new Error('No reducer emitted'));
      }
    }, 100);

    reducer$.addListener({
      next: (reducer) => {
        if (!receivedReducer) {
          receivedReducer = true;
          const state = reducer(undefined);
          expect(state).to.have.property('sampleSize', 10);
          expect(state).to.have.property('populationSD', 2);
          expect(state).to.have.property('confidenceLevel', 0.95);
          expect(state).to.have.property('samples').that.is.empty;
          expect(state).to.have.property('coverage', 0);
          expect(state).to.have.property('collapsed', false);
          clearTimeout(timeout);
          done();
        }
      },
      error: done
    });
  });

  it('should preserve existing state', (done) => {
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
    let receivedReducer = false;

    const timeout = setTimeout(() => {
      if (receivedReducer) {
        done();
      } else {
        done(new Error('No reducer emitted'));
      }
    }, 100);

    reducer$.addListener({
      next: (reducer) => {
        if (!receivedReducer) {
          receivedReducer = true;
          const existingState = {
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
          };
          const newState = reducer(existingState);
          expect(newState).to.equal(existingState);
          clearTimeout(timeout);
          done();
        }
      },
      error: done
    });
  });
});
