import xs, { Stream } from 'xstream';
import type { VNode } from '@cycle/dom';
import { div, label, input, span, p } from '@cycle/dom';
import { localizeText } from '@stats-viz/shared/i18n';
import type { Language } from '@stats-viz/shared/language';
import type { ParamsState } from './types';

function formatValue(value: number): string {
  return value.toFixed(2);
}

export function view(state$: Stream<ParamsState>, language$: Stream<Language>): Stream<VNode> {
  return xs.combine(state$, language$).map(([state, language]) => {
    const t = (text: string): string => localizeText(text, language);

    return (
    div('.control-panel', [
      div('.control-panel__title', t('Control Panel')),
      p(
        '.control-panel__intro',
        t('Change the decision rule and effect size to see how the shaded error regions respond.')
      ),
      div('.control-panel__slider', [
        div('.control-panel__label-row', [
          label('.control-panel__label', { attrs: { for: 'alpha' } }, t('Alpha (α)')),
          span('.control-panel__value', formatValue(state.alpha)),
        ]),
        p('.control-panel__hint', t('Sets the false-positive rate and controls the rejection region.')),
        input('.control-panel__input', {
          attrs: {
            type: 'range',
            id: 'alpha',
            min: '0.01',
            max: '0.2',
            step: '0.01',
            value: String(state.alpha)
          }
        })
      ]),
      div('.control-panel__slider', [
        div('.control-panel__label-row', [
          label('.control-panel__label', { attrs: { for: 'null-mean' } }, t('Null Mean (μ₀)')),
          span('.control-panel__value', formatValue(state.nullMean)),
        ]),
        p('.control-panel__hint', t('Defines the center of the null distribution.')),
        input('.control-panel__input', {
          attrs: {
            type: 'range',
            id: 'null-mean',
            min: '-2',
            max: '2',
            step: '0.1',
            value: String(state.nullMean)
          }
        })
      ]),
      div('.control-panel__slider', [
        div('.control-panel__label-row', [
          label('.control-panel__label', { attrs: { for: 'true-mean' } }, t('True Mean (μ₁)')),
          span('.control-panel__value', formatValue(state.trueMean)),
        ]),
        p('.control-panel__hint', t('Moves the true distribution and changes the effect size.')),
        input('.control-panel__input', {
          attrs: {
            type: 'range',
            id: 'true-mean',
            min: '0',
            max: '3',
            step: '0.1',
            value: String(state.trueMean)
          }
        })
      ]),
      div('.control-panel__slider', [
        div('.control-panel__label-row', [
          label('.control-panel__label', { attrs: { for: 'std-dev' } }, t('Standard Deviation (σ)')),
          span('.control-panel__value', formatValue(state.stdDev)),
        ]),
        p('.control-panel__hint', t('Wider distributions increase overlap and usually raise beta.')),
        input('.control-panel__input', {
          attrs: {
            type: 'range',
            id: 'std-dev',
            min: '0.1',
            max: '2',
            step: '0.1',
            value: String(state.stdDev)
          }
        })
      ])
    ])
    );
  });
}
