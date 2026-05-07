import { div, h1, p, span, type VNode } from '@cycle/dom';
import type { Stream } from 'xstream';
import type { HeroProps } from './types';

export function view(props$: Stream<HeroProps>): Stream<VNode> {
  return props$.map((props) =>
    div('.hero-panel', [
      div('.hero-copy', [
        p('.eyebrow', props.eyebrow),
        h1('.hero-title', props.title),
        p('.hero-text', props.description),
      ]),
      div('.hero-tips', [
        ...props.highlights.map((highlight) =>
          span('.tip-chip', highlight)
        ),
      ]),
    ])
  );
}
