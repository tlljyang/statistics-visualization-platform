import type { Stream } from 'xstream';
import type { VNode } from '@cycle/dom';

export interface HeroProps {
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
}

export interface HeroSources {
  props: Stream<HeroProps>;
}

export interface HeroSinks {
  DOM: Stream<VNode>;
}
