import type { Sources, Actions } from './types';
import { $el } from '../../utils/dom-helper';

export function intent(sources: Sources): Actions {
  const alpha$ = $el(sources.DOM, '#alpha')
    .events('input')
    .map((ev: Event) => Number((ev.target as HTMLInputElement).value));

  const nullMean$ = $el(sources.DOM, '#null-mean')
    .events('input')
    .map((ev: Event) => Number((ev.target as HTMLInputElement).value));

  const trueMean$ = $el(sources.DOM, '#true-mean')
    .events('input')
    .map((ev: Event) => Number((ev.target as HTMLInputElement).value));

  const stdDev$ = $el(sources.DOM, '#std-dev')
    .events('input')
    .map((ev: Event) => Number((ev.target as HTMLInputElement).value));

  return {
    alpha$,
    nullMean$,
    trueMean$,
    stdDev$,
  };
}
