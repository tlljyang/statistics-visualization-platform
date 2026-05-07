import {
  div,
  h2,
  label,
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
    div('.sidebar.p-4.border-end.bg-light.h-100', [
      // Title
      h2('.sidebar-title.h4.mb-4', 'Regression Teaching Tool'),

      // Dataset selection section
      div('.sidebar-section.mb-4.mt-4', [
        label(
          '.sidebar-label.form-label',
          { attrs: { for: 'dataset-select' } },
          'Select Dataset:'
        ),
        select(
          '#dataset-select.dataset-select.form-select',
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

      // Regression toggle section
      div('.sidebar-section.mb-4.mt-4', [
        div('.form-check.form-switch', [
          input('#regression-toggle.regression-toggle.form-check-input', {
            attrs: {
              type: 'checkbox',
              checked: state.showRegression,
            },
          }),
          label(
            '.form-check-label',
            { attrs: { for: 'regression-toggle' } },
            'Show Regression Line'
          ),
        ]),
      ]),

      // Clear custom line button section
      div('.sidebar-section.mb-4.mt-4', [
        button(
          '.clear-custom-line.btn.btn-outline-secondary',
          { attrs: { type: 'button' } },
          'Clear Custom Line'
        ),
      ]),

      // Info section (optional)
      state.datasets.length > 0
        ? div('.sidebar-info.card.mt-3', [
            div('.card-body', [
              div('.info-item.mb-2', [
                span('.info-label.fw-bold', 'Selected: '),
                span(
                  '.info-value',
                  state.datasets.find((d) => d.id === state.selectedDataset)
                    ?.name || 'None'
                ),
              ]),
              div('.info-item', [
                span('.info-label.fw-bold', 'Data Points: '),
                span(
                  '.info-value',
                  String(
                    state.datasets.find((d) => d.id === state.selectedDataset)
                      ?.data.length || 0
                  )
                ),
              ]),
            ]),
          ])
        : null,
    ])
  );
}
