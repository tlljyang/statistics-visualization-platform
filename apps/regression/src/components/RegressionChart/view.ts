import type { Stream } from 'xstream';
import { svg, h } from '@cycle/dom';
import type { VNode } from '@cycle/dom';
import { localizeText } from '@stats-viz/shared/i18n';
import type { State } from './types';
import { createXAxisVNode, createYAxisVNode } from '../../d3/axes';
import {
  createChartVNode,
  createTempLineVNode,
  createCustomLineVNode,
  createVerticalLineVNode,
  createHoveredPointVNode,
} from '../../d3/graph';

export function view(state$: Stream<State>): Stream<VNode> {
  return state$.map((state) => {
    const {
      width,
      height,
      margins,
      scales,
      datasets,
      customLine,
      regression,
      showRegression,
      hover,
      props,
    } = state;
    const chartWidth = width - margins.left - margins.right;
    const chartHeight = height - margins.top - margins.bottom;
    const xGridTicks = scales.xScale.ticks(6);
    const yGridTicks = scales.yScale.ticks(6);

    return h('div.regression-chart', [
      svg(
        {
          attrs: {
            width: String(width),
            height: String(height),
            viewBox: `0 0 ${width} ${height}`,
            preserveAspectRatio: 'xMidYMid meet',
            class: 'chart-svg',
            role: 'img',
            'data-margin-left': margins.left,
            'data-margin-top': margins.top,
          },
        },
        [
          // Main chart group
          svg.g(
            {
              attrs: {
                transform: `translate(${margins.left}, ${margins.top})`,
              },
            },
            [
              svg.rect({
                attrs: {
                  class: 'plot-background',
                  x: 0,
                  y: 0,
                  width: chartWidth,
                  height: chartHeight,
                  rx: 14,
                },
              }),
              svg.g(
                {
                  attrs: { class: 'chart-grid chart-grid--x' },
                },
                xGridTicks.map((tick) =>
                  svg.line({
                    attrs: {
                      x1: scales.xScale(tick),
                      y1: 0,
                      x2: scales.xScale(tick),
                      y2: chartHeight,
                    },
                  })
                )
              ),
              svg.g(
                {
                  attrs: { class: 'chart-grid chart-grid--y' },
                },
                yGridTicks.map((tick) =>
                  svg.line({
                    attrs: {
                      x1: 0,
                      y1: scales.yScale(tick),
                      x2: chartWidth,
                      y2: scales.yScale(tick),
                    },
                  })
                )
              ),
              // X Axis
              svg.g(
                {
                  attrs: { transform: `translate(0, ${chartHeight})` },
                },
                [createXAxisVNode(scales.xScale)]
              ),

              // Y Axis
              svg.g({ attrs: { transform: 'translate(0, 0)' } }, [
                createYAxisVNode(scales.yScale),
              ]),

              // Scatter plot + regression line (controlled by showRegression)
              createChartVNode(
                datasets,
                scales,
                showRegression,
                showRegression ? regression : undefined
              ),

              // Vertical line from hovered point to visible line (regression or custom)
              hover.showVerticalLine && hover.point && hover.lineY !== null
                ? createVerticalLineVNode(hover.point, hover.lineY, scales)
                : svg.g(),

              // Highlight hovered point
              hover.point
                ? createHoveredPointVNode(hover.point, scales)
                : svg.g(),

              // Custom line (user-drawn)
              createCustomLineVNode(
                customLine.finalPoints,
                scales,
                customLine.isShowCustomLine
              ),

              // Temp line (while dragging)
              createTempLineVNode(
                customLine.tempPoints,
                scales,
                customLine.isDragging
              ),
              svg.text(
                {
                  attrs: {
                    class: 'chart-axis-label chart-axis-label--x',
                    x: chartWidth,
                    y: chartHeight + 42,
                    'text-anchor': 'end',
                  },
                },
                localizeText(props.xLabel || 'Explanatory variable', props.language)
              ),
              svg.text(
                {
                  attrs: {
                    class: 'chart-axis-label chart-axis-label--y',
                    x: -chartHeight / 2,
                    y: -46,
                    transform: 'rotate(-90)',
                    'text-anchor': 'middle',
                  },
                },
                localizeText(props.yLabel || 'Response', props.language)
              ),
            ]
          ),
        ]
      ),
    ]);
  });
}
