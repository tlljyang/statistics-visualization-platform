import { view } from './view';
import type { HeroSources, HeroSinks } from './types';

export function Hero(sources: HeroSources): HeroSinks {
  return {
    DOM: view(sources.props),
  };
}

export type { HeroProps, HeroSources, HeroSinks } from './types';
