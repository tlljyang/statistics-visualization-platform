import xs from 'xstream';
import fromDiagram from 'xstream/extra/fromDiagram';
import { mockDOMSource } from '@cycle/dom';
import { expect } from 'vitest';

export function createMockDOMSource(events: Record<string, string>) {
  const sources: Record<string, any> = {};

  for (const [selector, diagram] of Object.entries(events)) {
    sources[selector] = {
      input: fromDiagram(diagram).mapTo({ target: { value: '0.05' } })
    };
  }

  return mockDOMSource(sources);
}

export function expectStreamSequence<T>(
  stream: xs<T>,
  expected: T[],
  done: (error?: unknown) => void
) {
  const actual: T[] = [];

  stream.addListener({
    next: (val) => actual.push(val),
    complete: () => {
      try {
        expect(actual).toStrictEqual(expected);
        done();
      } catch (e) {
        done(e);
      }
    },
    error: done
  });
}

export function createMockState<T>(initialState: T) {
  return {
    stream: xs.of(initialState)
  };
}
