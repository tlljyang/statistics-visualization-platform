import { div, h1, p, span, type VNode } from '@cycle/dom';
import type { Stream } from 'xstream';
import type { HeroProps } from './types';

export function view(props$: Stream<HeroProps>): Stream<VNode> {
  return props$.map((props) =>
    div('.hero-panel.bg-white.border.rounded-4.shadow-sm.p-4.p-lg-5', [
      div('.d-flex.flex-column.flex-lg-row.justify-content-between.align-items-start.gap-4', [
        div('.hero-copy', [
          p('.text-uppercase.text-secondary.fw-semibold.small.mb-2', props.eyebrow),
          h1('.display-6.fw-bold.mb-3', props.title),
          p('.lead.text-body-secondary.mb-0', props.description),
        ]),
        div('.d-flex.flex-wrap.gap-2.justify-content-lg-end', [
          ...props.highlights.map((highlight) =>
            span('.badge.text-bg-light.border.text-secondary.px-3.py-2', highlight)
          ),
        ]),
      ]),
    ])
  );
}
