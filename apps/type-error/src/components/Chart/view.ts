import xs, { Stream } from 'xstream';
import type { VNode } from '@cycle/dom';
import { h, svg } from '@cycle/dom';
import type { ChartProps } from './types';
import {
  NullDistribution,
  TrueDistribution,
  CriticalLine,
  Type1ErrorArea,
  Type2ErrorArea,
  HypothesisText,
} from './graph';
import { XAxis, YAxis } from './axes';

const MARGIN = { top: 50, right: 30, bottom: 50, left: 50 };

export function view(props$: Stream<ChartProps>): Stream<VNode> {
  return props$.map((props) => {
    const { width, height, scales, nullDistribution, trueDistribution, criticalValue, criticalAreaFn, hypothesisText } = props;

    return h('div.chart', [
      svg({attrs: {
        width: String(width),
        height: String(height),
        viewBox: `0 0 ${width} ${height}`,
      }}, [
        svg.g({attrs: {
          transform: `translate(${MARGIN.left}, ${MARGIN.top})`,
        }}, [
          NullDistribution({ data: nullDistribution, scales }),
          TrueDistribution({ data: trueDistribution, scales }),
          Type1ErrorArea({
            data: nullDistribution,
            criticalValue,
            filterFn: criticalAreaFn,
            scales,
          }),
          Type2ErrorArea({
            data: trueDistribution,
            criticalValue,
            filterFn: criticalAreaFn,
            scales,
          }),
          CriticalLine({ criticalValue, scales }),
          svg.g({ attrs: { transform: `translate(0, ${height - MARGIN.top - MARGIN.bottom})` } }, [
            XAxis({ scale: scales.xScale }),
          ]),
          YAxis({ scale: scales.yScale }),
          svg.text({
            attrs: {
              class: 'chart-axis-label',
              x: String((width - MARGIN.left - MARGIN.right) / 2),
              y: String(height - MARGIN.top - 8),
              'text-anchor': 'middle',
            },
          }, 'Test Statistic'),
          svg.text({
            attrs: {
              class: 'chart-axis-label',
              transform: `translate(${-36}, ${(height - MARGIN.top - MARGIN.bottom) / 2}) rotate(-90)`,
              'text-anchor': 'middle',
            },
          }, 'Density'),
          HypothesisText({ text0: hypothesisText.H0Text, text1: hypothesisText.H1Text }),
        ]),
      ]),
    ]);
  });
}
