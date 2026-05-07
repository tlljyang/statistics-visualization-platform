import { div, h4, span, small } from '@cycle/dom';
import type { Stream } from 'xstream';
import type { VNode } from '@cycle/dom';
import type { State } from './types';

/**
 * View for StatisticsPanel Component
 *
 * Pure function that transforms state to VNode.
 * Displays SSE and residual information.
 *
 * @param state$ - State stream
 * @returns Virtual DOM stream
 */
export function view(state$: Stream<State>): Stream<VNode> {
  return state$.map((state) => {
    const { sse, hover } = state;

    // Format SSE value (fixed to 4 decimal places)
    const formattedSSE = sse.value.toFixed(4);

    // Line type display
    const lineTypeDisplay =
      sse.lineType === 'regression'
        ? 'Regression Line'
        : sse.lineType === 'custom'
        ? 'Custom Line'
        : 'No Line';

    // Line type badge class
    const lineTypeBadge =
      sse.lineType === 'regression'
        ? 'bg-success'
        : sse.lineType === 'custom'
        ? 'bg-danger'
        : 'bg-secondary';

    return div('.statistics-panel.card.shadow-sm', [
      // Title
      h4('.statistics-title', 'Statistics'),

      // SSE Section
      div('.sse-section', [
        div('.stat-row', [
          span('.stat-label', 'Sum of Squared Errors (SSE)'),
          span('.stat-value', formattedSSE),
        ]),
        div('.stat-row', [
          span('.stat-label', 'Line Type'),
          span(`.badge.${lineTypeBadge}`, lineTypeDisplay),
        ]),
      ]),

      // Residual Section (always shown, horizontal layout)
      div('.residual-section', [
        div('.d-flex.flex-row.align-items-center.flex-wrap', [
          span('.stat-label.me-2', 'Hover:'),
          hover.point !== null &&
          hover.residual !== null &&
          hover.lineY !== null &&
          hover.point.x !== undefined &&
          hover.point.y !== undefined
            ? div([
                span(
                  '.stat-value.me-2',
                  `(${hover.point.x.toFixed(2)}, ${hover.point.y.toFixed(2)})`
                ),
                small('.text-muted.mx-2', '|'),
                span('.stat-label.me-1', 'Res:'),
                span('.stat-value.me-2', hover.residual.toFixed(4)),
                small('.text-muted.mx-2', '|'),
                span('.stat-label.me-1', 'Y hat:'),
                span('.stat-value', hover.lineY.toFixed(4)),
              ])
            : span('.stat-value.text-muted', 'Hover over a point'),
        ]),
      ]),
    ]);
  });
}
