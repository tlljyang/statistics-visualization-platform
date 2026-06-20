import {
  div,
  h2,
  label,
  p,
  select,
  option,
  input,
  button,
  span,
  type VNode,
} from '@cycle/dom';
import xs, { Stream } from 'xstream';
import { localizeText } from '@stats-viz/shared/i18n';
import type { Language } from '@stats-viz/shared/language';
import type { SidebarState } from './types';

export function view(state$: Stream<SidebarState>, language$: Stream<Language>): Stream<VNode> {
  return xs.combine(state$, language$).map(([state, language]) => {
    const t = (text: string | undefined): string => text ? localizeText(text, language) : '';
    const selectedDataset = state.datasets.find((d) => d.id === state.selectedDataset);

    return (
    div('.control-panel', [
      h2('.control-panel__title', t('Control Panel')),
      p(
        '.control-panel__intro',
        t('Choose a dataset, reveal the regression line, and clear your hand-drawn line when you want to try again.')
      ),

      div('.control-panel__group', [
        div('.control-panel__label-row', [
          span('.control-panel__label', t('Dataset')),
          span('.control-panel__value', String(state.datasets.length)),
        ]),
        p('.control-panel__hint', t('Switch the scatterplot students are reasoning from.')),
        label(
          '.sr-only',
          { attrs: { for: 'dataset-select' } },
          t('Select Dataset')
        ),
        select(
          '#dataset-select.dataset-select.control-panel__select',
          { attrs: { disabled: state.datasets.length === 0 } },
          [
            state.datasets.length === 0
              ? option(
                  { attrs: { value: '', disabled: true, selected: true } },
                  t('No datasets available')
                )
              : null,
            ...state.datasets.map((dataset) =>
              option(
                {
                  attrs: {
                    value: dataset.id,
                    selected: dataset.id === state.selectedDataset,
                  },
                },
                t(dataset.name)
              )
            ),
          ].filter(Boolean)
        ),
      ]),

      div('.control-panel__group', [
        label('.toggle-row', { attrs: { for: 'regression-toggle' } }, [
          span('.toggle-row__copy', [
            span('.control-panel__label', t('Regression line')),
            span('.control-panel__hint', t('Compare the model fit with a custom line.')),
          ]),
          input('#regression-toggle.regression-toggle.toggle-row__input', {
            attrs: {
              type: 'checkbox',
              checked: state.showRegression,
            },
          }),
        ]),
      ]),

      div('.control-panel__group', [
        label('.toggle-row', { attrs: { for: 'outlier-toggle' } }, [
          span('.toggle-row__copy', [
            span('.control-panel__label', t('Outliers removed')),
            span('.control-panel__hint', t('Compare the fit with influential observations excluded.')),
          ]),
          input('#outlier-toggle.outlier-toggle.toggle-row__input', {
            attrs: {
              type: 'checkbox',
              checked: !state.showOutliers,
            },
          }),
        ]),
      ]),

      div('.control-panel__actions', [
        button(
          '.clear-custom-line.control-panel__button',
          { attrs: { type: 'button' } },
          t('Clear Custom Line')
        ),
      ]),

      state.datasets.length > 0
        ? div('.control-panel__summary-card', [
              div('.info-item', [
                span('.metric-label', t('Selected dataset')),
                span(
                  '.metric-value',
                  t(selectedDataset?.name || 'None')
                ),
              ]),
              div('.info-item', [
                span('.metric-label', t('Data points')),
                span(
                  '.metric-value',
                  String(
                    (selectedDataset?.data.length || 0) -
                      (state.showOutliers
                        ? 0
                        : selectedDataset?.data.filter((point) => point.outlier).length || 0)
                  )
                ),
              ]),
              div('.info-item', [
                span('.metric-label', t('Outliers')),
                span(
                  '.metric-value.metric-value--compact',
                  state.showOutliers
                    ? t('Included')
                    : t('Removed')
                ),
              ]),
              selectedDataset?.source
                ? div('.info-item', [
                    span('.metric-label', t('Source')),
                    span(
                      '.metric-value.metric-value--compact',
                      t(selectedDataset?.source || '')
                    ),
                  ])
                : null,
              selectedDataset?.xLabel
                ? div('.info-item', [
                    span('.metric-label', t('X variable')),
                    span(
                      '.metric-value.metric-value--compact',
                      t(selectedDataset?.xLabel || '')
                    ),
                  ])
                : null,
              selectedDataset?.yLabel
                ? div('.info-item', [
                    span('.metric-label', t('Y variable')),
                    span(
                      '.metric-value.metric-value--compact',
                      t(selectedDataset?.yLabel || '')
                    ),
                  ])
                : null,
          ])
        : null,
    ])
    );
  });
}
