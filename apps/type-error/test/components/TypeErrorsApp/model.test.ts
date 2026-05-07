import xs from 'xstream';
import fromDiagram from 'xstream/extra/fromDiagram';
import { expect } from 'chai';
import { model } from '../../../src/components/TypeErrorsApp/model';
import type { Sources, AppState } from '../../../src/components/TypeErrorsApp/types';
import { mockDOMSource } from '@cycle/dom';

describe('TypeErrorsApp model', () => {
  it('should initialize with defaultReducer', (done) => {
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

    const { reducer$ } = model(undefined, sources);

    // Apply the first reducer (defaultReducer) as it arrives
    reducer$.take(1).addListener({
      next: (reducer) => {
        const initialState = reducer(undefined);
        if (!initialState) {
          done(new Error('Initial state is undefined'));
          return;
        }
        expect(initialState).to.have.property('config');
        expect(initialState).to.have.property('params');
        expect(initialState).to.have.property('computed');

        expect(initialState.config).to.deep.equal({
          width: 800,
          height: 400,
          testType: 'right-tailed',
        });

        expect(initialState.params).to.deep.equal({
          alpha: 0.05,
          nullMean: 0,
          trueMean: 1,
          stdDev: 1,
        });

        expect(initialState.computed).to.have.property('scales');
        expect(initialState.computed).to.have.property('nullDistribution');
        expect(initialState.computed).to.have.property('trueDistribution');
        expect(initialState.computed).to.have.property('criticalValue');
        expect(initialState.computed).to.have.property('criticalAreaFn');
        expect(initialState.computed).to.have.property('hypothesisText');

        done();
      },
      error: done,
    });
  });

  it('should recompute computed state when params change', (done) => {
    // Create initial state
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

    // Create state stream that emits initial state then updated state
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

    const { reducer$ } = model(undefined, sources);

    // Apply reducers as they arrive
    let state: AppState | undefined;
    let reducerCount = 0;

    reducer$.addListener({
      next: (reducer) => {
        if (reducerCount === 0) {
          // First reducer: initialize with defaults
          state = reducer(undefined);
          expect(state!.params.alpha).to.equal(0.05);
          expect(state!.params.nullMean).to.equal(0);
          expect(state!.params.trueMean).to.equal(1);
          expect(state!.params.stdDev).to.equal(1);
        } else if (reducerCount === 1) {
          // Second reducer: recompute computed state based on params in state
          state = reducer(state);
          // Verify that computed state was recalculated with new params
          expect(state!.computed.scales).to.be.an('object');
          expect(state!.computed.scales.xScale).to.be.a('function');
          expect(state!.computed.scales.yScale).to.be.a('function');

          expect(state!.computed.nullDistribution).to.be.an('array');
          expect(state!.computed.nullDistribution.length).to.be.greaterThan(0);

          expect(state!.computed.trueDistribution).to.be.an('array');
          expect(state!.computed.trueDistribution.length).to.be.greaterThan(0);

          expect(state!.computed.criticalValue).to.be.an('array');
          expect(state!.computed.criticalAreaFn).to.be.a('function');

          expect(state!.computed.hypothesisText).to.be.an('object');
          expect(state!.computed.hypothesisText.H0Text).to.be.a('string');
          expect(state!.computed.hypothesisText.H1Text).to.be.a('string');

          done();
        }
        reducerCount++;
      },
      error: done,
    });
  });

  it('should compute scales based on config dimensions', (done) => {
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

    const { reducer$ } = model(undefined, sources);

    reducer$.take(1).addListener({
      next: (reducer) => {
        const state = reducer(undefined) as AppState;
        const { xScale, yScale } = state.computed.scales;

        // Verify xScale domain and range
        expect(xScale.domain()).to.deep.equal([-5, 10]);
        const xRange = xScale.range();
        expect(xRange[1]! - xRange[0]!).to.equal(1000 - 40 - 10); // width - marginLeft - marginRight

        // Verify yScale domain and range
        expect(yScale.domain()).to.deep.equal([0, 0.5]);
        const yRange = yScale.range();
        expect(yRange[0]! - yRange[1]!).to.equal(500 - 20 - 30); // height - marginTop - marginBottom

        done();
      },
      error: done,
    });
  });

  it('should compute distributions based on params', (done) => {
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

    const { reducer$ } = model(undefined, sources);

    reducer$.take(1).addListener({
      next: (reducer) => {
        const state = reducer(undefined) as AppState;
        const { nullDistribution, trueDistribution } = state.computed;

        // Verify null distribution points
        expect(nullDistribution).to.be.an('array');
        expect(nullDistribution.length).to.be.greaterThan(0);
        const firstNullPoint = nullDistribution[0];
        if (firstNullPoint) {
          expect(firstNullPoint).to.have.property('x');
          expect(firstNullPoint).to.have.property('y');
          expect(firstNullPoint.x).to.equal(-5); // First x value in range
        }

        // Verify true distribution points
        expect(trueDistribution).to.be.an('array');
        expect(trueDistribution.length).to.be.greaterThan(0);
        const firstTruePoint = trueDistribution[0];
        if (firstTruePoint) {
          expect(firstTruePoint).to.have.property('x');
          expect(firstTruePoint).to.have.property('y');
        }

        done();
      },
      error: done,
    });
  });

  it('should compute critical values based on test type and params', (done) => {
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

    const { reducer$ } = model(undefined, sources);

    reducer$.take(1).addListener({
      next: (reducer) => {
        const state = reducer(undefined) as AppState;
        const { criticalValue } = state.computed;

        // Right-tailed test should have 1 critical value
        expect(criticalValue).to.be.an('array');
        expect(criticalValue.length).to.equal(1);
        expect(criticalValue[0]).to.be.a('number');

        done();
      },
      error: done,
    });
  });

  it('should generate hypothesis text based on test type', (done) => {
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

    const { reducer$ } = model(undefined, sources);

    reducer$.take(1).addListener({
      next: (reducer) => {
        const state = reducer(undefined) as AppState;
        const { hypothesisText } = state.computed;

        expect(hypothesisText).to.deep.equal({
          H0Text: 'H₀: μ = 0',
          H1Text: 'Hₐ: μ < 0',
        });

        done();
      },
      error: done,
    });
  });

  it('should handle two-tailed test correctly', (done) => {
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

    const { reducer$ } = model(undefined, sources);

    reducer$.take(1).addListener({
      next: (reducer) => {
        const state = reducer(undefined) as AppState;
        const { criticalValue, hypothesisText } = state.computed;

        // Two-tailed test should have 2 critical values
        expect(criticalValue).to.be.an('array');
        expect(criticalValue.length).to.equal(2);

        expect(hypothesisText).to.deep.equal({
          H0Text: 'H₀: μ = 0',
          H1Text: 'Hₐ: μ ≠ 0',
        });

        done();
      },
      error: done,
    });
  });
});
