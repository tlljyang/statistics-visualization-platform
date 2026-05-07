import xs from 'xstream';
import { expect } from 'chai';
import fromDiagram from 'xstream/extra/fromDiagram';
import { mockDOMSource } from '@cycle/dom';
import { intent } from '../../../src/components/ControlPanel/intent';
import type { Sources } from '../../../src/components/ControlPanel/types';

describe('ControlPanel intent', () => {
  it('should extract alpha slider input sequence', (done) => {
    const diagram = 'a-b-c-|';
    const inputValues = ['0.05', '0.08', '0.10'];
    let index = 0;
    const DOM = mockDOMSource({
      '#alpha': {
        'input': fromDiagram(diagram).map(() => ({ target: { value: inputValues[index++] } }))
      }
    });

    const sources = {
      DOM,
      state: { stream: xs.of({ alpha: 0.05, nullMean: 0, trueMean: 1, stdDev: 1 }) }
    } as unknown as Sources;

    const actions = intent(sources);
    const values: number[] = [];

    actions.alpha$.addListener({
      next: (val) => values.push(val),
      complete: () => {
        expect(values).to.have.length(3);
        expect(values).to.deep.equal([0.05, 0.08, 0.10]);
        done();
      },
      error: done
    });
  });

  it('should extract nullMean slider input', (done) => {
    const diagram = 'a-b-|';
    const DOM = mockDOMSource({
      '#null-mean': {
        'input': fromDiagram(diagram).mapTo({ target: { value: '0' } })
      }
    });

    const sources = {
      DOM,
      state: { stream: xs.of({ alpha: 0.05, nullMean: 0, trueMean: 1, stdDev: 1 }) }
    } as unknown as Sources;

    const actions = intent(sources);
    const values: number[] = [];

    actions.nullMean$.addListener({
      next: (val) => values.push(val),
      complete: () => {
        expect(values).to.have.length(2);
        expect(values.every(v => v === 0)).to.be.true;
        done();
      },
      error: done
    });
  });

  it('should extract trueMean slider input', (done) => {
    const diagram = 'a-b-c-d-|';
    const DOM = mockDOMSource({
      '#true-mean': {
        'input': fromDiagram(diagram).mapTo({ target: { value: '1' } })
      }
    });

    const sources = {
      DOM,
      state: { stream: xs.of({ alpha: 0.05, nullMean: 0, trueMean: 1, stdDev: 1 }) }
    } as unknown as Sources;

    const actions = intent(sources);
    const values: number[] = [];

    actions.trueMean$.addListener({
      next: (val) => values.push(val),
      complete: () => {
        expect(values).to.have.length(4);
        expect(values.every(v => v === 1)).to.be.true;
        done();
      },
      error: done
    });
  });

  it('should extract stdDev slider input', (done) => {
    const diagram = 'a-|';
    const DOM = mockDOMSource({
      '#std-dev': {
        'input': fromDiagram(diagram).mapTo({ target: { value: '1' } })
      }
    });

    const sources = {
      DOM,
      state: { stream: xs.of({ alpha: 0.05, nullMean: 0, trueMean: 1, stdDev: 1 }) }
    } as unknown as Sources;

    const actions = intent(sources);
    const values: number[] = [];

    actions.stdDev$.addListener({
      next: (val) => values.push(val),
      complete: () => {
        expect(values).to.have.length(1);
        expect(values[0]).to.equal(1);
        done();
      },
      error: done
    });
  });
});
