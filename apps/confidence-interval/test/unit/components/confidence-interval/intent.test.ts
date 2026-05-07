import { expect } from 'chai';
import xs from 'xstream';
import { mockDOMSource } from '@cycle/dom';
import intent from '../../../../src/components/confidence-interval/intent';
import type { Sources } from '../../../../src/components/confidence-interval/types';

describe('ConfidenceInterval Intent', () => {
  it('should extract sampleSize from input events', (done) => {
    const mockInput = xs.of(
      { target: { value: '20' } },
      { target: { value: '30' } }
    );

    const domSource = mockDOMSource({
      '#sampleSize': { input: mockInput }
    }) as any;

    const sources: Sources = { DOM: domSource, state: {} as any };
    const actions = intent(sources);

    let count = 0;
    actions.sampleSize$.subscribe({
      next: (val: number) => {
        if (count === 0) {
          expect(val).to.equal(20);
        } else if (count === 1) {
          expect(val).to.equal(30);
          done();
        }
        count++;
      },
      error: done
    });
  });

  it('should extract populationSD from input events', (done) => {
    const mockInput = xs.of(
      { target: { value: '1.5' } },
      { target: { value: '3.0' } }
    );

    const domSource = mockDOMSource({
      '#populationSD': { input: mockInput }
    }) as any;

    const sources: Sources = { DOM: domSource, state: {} as any };
    const actions = intent(sources);

    let count = 0;
    actions.populationSD$.subscribe({
      next: (val: number) => {
        if (count === 0) {
          expect(val).to.equal(1.5);
        } else if (count === 1) {
          expect(val).to.equal(3.0);
          done();
        }
        count++;
      },
      error: done
    });
  });

  it('should extract confidenceLevel from change events', (done) => {
    const mockChange = xs.of(
      { target: { value: '0.9' } },
      { target: { value: '0.99' } }
    );

    const domSource = mockDOMSource({
      '#confidenceLevel': { change: mockChange }
    }) as any;

    const sources: Sources = { DOM: domSource, state: {} as any };
    const actions = intent(sources);

    let count = 0;
    actions.confidenceLevel$.subscribe({
      next: (val: number) => {
        if (count === 0) {
          expect(val).to.equal(0.9);
        } else if (count === 1) {
          expect(val).to.equal(0.99);
          done();
        }
        count++;
      },
      error: done
    });
  });

  it('should extract click events from buttons', (done) => {
    const mockClick = xs.of({}, {});

    const domSource = mockDOMSource({
      '#generateSample': { click: mockClick },
      '#generateMultiple': { click: mockClick },
      '#reset': { click: mockClick },
      '#toggleSidebar': { click: mockClick }
    }) as any;

    const sources: Sources = { DOM: domSource, state: {} as any };
    const actions = intent(sources);

    let addCount = 0;
    let addMultipleCount = 0;
    let resetCount = 0;
    let toggleCount = 0;

    actions.addSampleClick$.subscribe({
      next: () => { addCount++; }
    });

    actions.addMultipleClick$.subscribe({
      next: () => { addMultipleCount++; }
    });

    actions.resetClick$.subscribe({
      next: () => { resetCount++; }
    });

    actions.toggleSidebar$.subscribe({
      next: () => {
        toggleCount++;
        if (toggleCount === 2) {
          expect(addCount).to.equal(2);
          expect(addMultipleCount).to.equal(2);
          expect(resetCount).to.equal(2);
          expect(toggleCount).to.equal(2);
          done();
        }
      },
      error: done
    });
  });

  it('should NOT use startWith - verify no initial values', (done) => {
    const domSource = mockDOMSource({
      '#sampleSize': { input: xs.never() },
      '#populationSD': { input: xs.never() },
      '#confidenceLevel': { change: xs.never() }
    }) as any;

    const sources: Sources = { DOM: domSource, state: {} as any };
    const actions = intent(sources);

    let sampleSizeEmitted = false;
    let populationSDEmitted = false;
    let confidenceLevelEmitted = false;

    actions.sampleSize$.subscribe({
      next: () => { sampleSizeEmitted = true; }
    });

    actions.populationSD$.subscribe({
      next: () => { populationSDEmitted = true; }
    });

    actions.confidenceLevel$.subscribe({
      next: () => { confidenceLevelEmitted = true; }
    });

    // Give time for any startWith values to emit
    setTimeout(() => {
      expect(sampleSizeEmitted).to.be.false;
      expect(populationSDEmitted).to.be.false;
      expect(confidenceLevelEmitted).to.be.false;
      done();
    }, 100);
  });
});
