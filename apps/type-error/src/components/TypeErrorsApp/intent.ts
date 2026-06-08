import type { Sources, Actions } from './types';
import { $el } from '../../utils/dom-helper';

export function intent(sources: Sources): Actions {
  const testType$ = $el(sources.DOM, '.test-type-tab')
    .events('click')
    .map((ev: Event) => {
      const target = ev.currentTarget as HTMLButtonElement;
      return target.dataset.testType as 'right-tailed' | 'two-tailed';
    })
    .filter((value: string): value is 'right-tailed' | 'two-tailed' =>
      value === 'right-tailed' || value === 'two-tailed'
    );

  return { testType$ };
}
