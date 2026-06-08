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
import { Stream } from 'xstream';
import type { SidebarState } from './types';

export function view(state$: Stream<SidebarState>): Stream<VNode> {
  return state$.map((state) =>
    div('.control-panel', [
      h2('.control-panel__title', 'Control Panel'),
      p(
        '.control-panel__intro',
        'Choose a dataset, reveal the regression line, and clear your hand-drawn line when you want to try again.'
      ),

      div('.control-panel__group', [
        div('.control-panel__label-row', [
          span('.control-panel__label', 'Dataset'),
          span('.control-panel__value', String(state.datasets.length)),
        ]),
        p('.control-panel__hint', 'Switch the scatterplot students are reasoning from.'),
        label(
          '.sr-only',
          { attrs: { for: 'dataset-select' } },
          'Select Dataset'
        ),
        select(
          '#dataset-select.dataset-select.control-panel__select',
          { attrs: { disabled: state.datasets.length === 0 } },
          [
            state.datasets.length === 0
              ? option(
                  { attrs: { value: '', disabled: true, selected: true } },
                  'No datasets available'
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
                dataset.name
              )
            ),
          ].filter(Boolean)
        ),
      ]),

      div('.control-panel__group', [
        label('.toggle-row', { attrs: { for: 'regression-toggle' } }, [
          span('.toggle-row__copy', [
            span('.control-panel__label', 'Regression line'),
            span('.control-panel__hint', 'Compare the model fit with a custom line.'),
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
            span('.control-panel__label', 'Show outliers'),
            span('.control-panel__hint', 'Hide or reveal influential observations to compare their effect.'),
          ]),
          input('#outlier-toggle.outlier-toggle.toggle-row__input', {
            attrs: {
              type: 'checkbox',
              checked: state.showOutliers,
            },
          }),
        ]),
      ]),

      div('.control-panel__actions', [
        button(
          '.clear-custom-line.control-panel__button',
          { attrs: { type: 'button' } },
          'Clear Custom Line'
        ),
      ]),

      state.datasets.length > 0
        ? div('.control-panel__summary-card', [
              div('.info-item', [
                span('.metric-label', 'Selected dataset'),
                span(
                  '.metric-value',
                  state.datasets.find((d) => d.id === state.selectedDataset)
                    ?.name || 'None'
                ),
              ]),
              div('.info-item', [
                span('.metric-label', 'Data points'),
                span(
                  '.metric-value',
                  String(
                    (state.datasets.find((d) => d.id === state.selectedDataset)
                      ?.data.length || 0) -
                      (state.showOutliers
                        ? 0
                        : state.datasets.find((d) => d.id === state.selectedDataset)
                            ?.data.filter((point) => point.outlier).length || 0)
                  )
                ),
              ]),
              div('.info-item', [
                span('.metric-label', 'Outliers'),
                span(
                  '.metric-value.metric-value--compact',
                  state.showOutliers
                    ? 'Shown'
                    : 'Hidden'
                ),
              ]),
              state.datasets.find((d) => d.id === state.selectedDataset)?.source
                ? div('.info-item', [
                    span('.metric-label', 'Source'),
                    span(
                      '.metric-value.metric-value--compact',
                      state.datasets.find((d) => d.id === state.selectedDataset)
                        ?.source || ''
                    ),
                  ])
                : null,
              state.datasets.find((d) => d.id === state.selectedDataset)?.xLabel
                ? div('.info-item', [
                    span('.metric-label', 'X variable'),
                    span(
                      '.metric-value.metric-value--compact',
                      state.datasets.find((d) => d.id === state.selectedDataset)
                        ?.xLabel || ''
                    ),
                  ])
                : null,
              state.datasets.find((d) => d.id === state.selectedDataset)?.yLabel
                ? div('.info-item', [
                    span('.metric-label', 'Y variable'),
                    span(
                      '.metric-value.metric-value--compact',
                      state.datasets.find((d) => d.id === state.selectedDataset)
                        ?.yLabel || ''
                    ),
                  ])
                : null,
          ])
        : null,
    ])
  );
}
