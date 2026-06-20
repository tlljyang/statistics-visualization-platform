import xs, { Stream } from 'xstream';
import type { VNode } from '@cycle/dom';
import { h, svg } from '@cycle/dom';
import { localizeText } from '@stats-viz/shared/i18n';
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
    const { width, height, scales, nullDistribution, trueDistribution, criticalValue, criticalAreaFn, hypothesisText, language } = props;
    const t = (text: string): string => localizeText(text, language);
    const plotWidth = width - MARGIN.left - MARGIN.right;
    const plotHeight = height - MARGIN.top - MARGIN.bottom;
    const legendWidth = 206;
    const legendHeight = 112;
    const legendX = Math.max(16, plotWidth - legendWidth - 14);
    const legendY = 12;
    const legendRows = [
      { kind: 'line', className: 'chart-inline-legend__line--null', label: t('Null distribution') },
      { kind: 'line', className: 'chart-inline-legend__line--true', label: t('True distribution') },
      { kind: 'dash', className: 'chart-inline-legend__line--critical', label: t('Critical boundary') },
      { kind: 'area', className: 'chart-inline-legend__area--type1', label: t('Type I error area') },
      { kind: 'area', className: 'chart-inline-legend__area--type2', label: t('Type II error area') },
    ];

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
              x: String(plotWidth / 2),
              y: String(height - MARGIN.top - 8),
              'text-anchor': 'middle',
            },
          }, t('Test Statistic')),
          svg.text({
            attrs: {
              class: 'chart-axis-label',
              transform: `translate(${-36}, ${plotHeight / 2}) rotate(-90)`,
              'text-anchor': 'middle',
            },
          }, t('Density')),
          HypothesisText({ text0: hypothesisText.H0Text, text1: hypothesisText.H1Text }),
          svg.g({
            attrs: {
              class: 'chart-inline-legend',
              transform: `translate(${legendX}, ${legendY})`,
            },
          }, [
            svg.rect({
              attrs: {
                class: 'chart-inline-legend__panel',
                width: String(legendWidth),
                height: String(legendHeight),
                rx: '12',
                ry: '12',
              },
            }),
            svg.text({
              attrs: {
                class: 'chart-inline-legend__title',
                x: '12',
                y: '20',
              },
            }, t('Legend')),
            ...legendRows.map((row, index) => {
              const y = 38 + index * 15;
              const marker =
                row.kind === 'area'
                  ? svg.rect({
                      attrs: {
                        class: `chart-inline-legend__area ${row.className}`,
                        x: '12',
                        y: String(y - 7),
                        width: '18',
                        height: '9',
                        rx: '3',
                        ry: '3',
                      },
                    })
                  : svg.line({
                      attrs: {
                        class: `chart-inline-legend__line ${row.className}`,
                        x1: '12',
                        x2: '30',
                        y1: String(y - 3),
                        y2: String(y - 3),
                      },
                    });

              return svg.g({ attrs: { class: 'chart-inline-legend__row' } }, [
                marker,
                svg.text({
                  attrs: {
                    class: 'chart-inline-legend__label',
                    x: '38',
                    y: String(y),
                  },
                }, row.label),
              ]);
            }),
          ]),
        ]),
      ]),
    ]);
  });
}
