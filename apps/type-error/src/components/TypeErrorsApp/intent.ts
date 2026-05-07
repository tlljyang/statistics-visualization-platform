import type { Sources, Actions } from './types';

export function intent(sources: Sources): Actions {
  // No top-level DOM events currently
  return {} as Actions;
}
