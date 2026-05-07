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
        ? 'line-badge--regression'
        : sse.lineType === 'custom'
        ? 'line-badge--custom'
        : 'line-badge--none';

    return div('.statistics-panel', [
      h4('.statistics-title', 'Statistics'),

      div('.sse-section', [
        div('.stat-row', [
          span('.stat-label', 'Sum of Squared Errors (SSE)'),
          span('.stat-value', formattedSSE),
        ]),
        div('.stat-row', [
          span('.stat-label', 'Line Type'),
          span(`.line-badge.${lineTypeBadge}`, lineTypeDisplay),
        ]),
      ]),

      div('.residual-section', [
        div('.residual-row', [
          span('.stat-label', 'Hover'),
          hover.point !== null &&
          hover.residual !== null &&
          hover.lineY !== null &&
          hover.point.x !== undefined &&
          hover.point.y !== undefined
            ? div([
                span(
                  '.stat-value',
                  `(${hover.point.x.toFixed(2)}, ${hover.point.y.toFixed(2)})`
                ),
                small('.stat-divider', '|'),
                span('.stat-label', 'Res'),
                span('.stat-value', hover.residual.toFixed(4)),
                small('.stat-divider', '|'),
                span('.stat-label', 'Y hat'),
                span('.stat-value', hover.lineY.toFixed(4)),
              ])
            : span('.stat-value.stat-value--muted', 'Hover over a point'),
        ]),
      ]),
    ]);
  });
}
