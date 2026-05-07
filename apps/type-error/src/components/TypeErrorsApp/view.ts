import xs, { Stream } from 'xstream';
import type { VNode } from '@cycle/dom';
import { div, h1, h2, h3, p, span, small } from '@cycle/dom';
import type { AppState } from './types';

function formatNumber(value: number): string {
  return value.toFixed(2);
}

function formatRate(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

function getCriticalValueLabel(state: AppState): string {
  const values = state.computed.criticalValue.map((value) => value.toFixed(2));

  if (state.config.testType === 'two-tailed') {
    return values.join(' and ');
  }

  return values[0] ?? '--';
}

function getInterpretation(state: AppState): string {
  if (state.computed.power >= 0.8) {
    return 'This setting has strong power, so the test is fairly likely to detect the true effect.';
  }

  if (state.computed.power >= 0.5) {
    return 'This setting has moderate power. Students can discuss how alpha, spread, and effect size interact.';
  }

  return 'This setting has low power, which makes Type II errors common even when a real effect exists.';
}

function getStrategyTip(state: AppState): string {
  if (Math.abs(state.computed.effectSize) < 0.5) {
    return 'The true mean is still close to the null mean, so the two curves overlap heavily.';
  }

  if (state.params.alpha <= 0.05) {
    return 'A strict alpha protects against false positives, but it can widen the acceptance region and raise beta.';
  }

  return 'A larger alpha lowers beta here, but the blue Type I region also expands.';
}

export function view(
  controlPanelDOM: Stream<VNode>,
  chartDOM: Stream<VNode>,
  state$: Stream<AppState>
): Stream<VNode> {
  return xs
    .combine(controlPanelDOM, chartDOM, state$)
    .map(([panel, chart, state]) =>
      div('.type-errors-app-shell', [
        div('.page-container', [
          div('.hero-panel', [
            div('.hero-copy', [
              p('.eyebrow', 'Interactive Hypothesis Testing Lab'),
              h1('.hero-title', 'See Type I and Type II errors as living shapes, not just definitions.'),
              p(
                '.hero-text',
                'Adjust alpha, move the true mean, and watch the rejection region, beta, and power update together in one teaching view.'
              ),
            ]),
            div('.hero-tips', [
              div('.tip-chip', 'Blue area = Type I error'),
              div('.tip-chip', 'Red area = Type II error'),
              div('.tip-chip', 'Power = 1 - beta'),
            ]),
          ]),

          div('.lesson-banner', [
            div('.lesson-meta', [
              div('.lesson-label', 'Current scenario'),
              h2('.lesson-title', 'Two distributions, one decision rule'),
              p(
                '.lesson-headline',
                'Use the null distribution to set the critical boundary, then inspect how often the true distribution falls on the wrong side.'
              ),
              p(
                '.lesson-prompt',
                'A smaller alpha usually protects against false positives, but can make false negatives more likely unless the effect size is large enough.'
              ),
            ]),
            div('.lesson-stats', [
              div('.lesson-stat', [
                span('.lesson-stat-label', 'Test type'),
                span('.lesson-stat-value', state.config.testType.replace('-', ' ')),
              ]),
              div('.lesson-stat', [
                span('.lesson-stat-label', 'Critical value'),
                span('.lesson-stat-value', getCriticalValueLabel(state)),
              ]),
            ]),
          ]),

          div('.content-grid', [
            div('.control-column', [panel]),
            div('.main-column', [
              div('.chart-card', [
                div('.chart-card-header', [
                  h3('.chart-card-title', 'Decision regions and overlapping distributions'),
                  p(
                    '.chart-card-subtitle',
                    'The blue curve represents the null hypothesis, the red curve the true distribution, and the shaded regions show the two kinds of error.'
                  ),
                ]),
                chart,
                div('.chart-legend', [
                  div('.legend-item', [
                    span('.legend-swatch.legend-swatch--blue'),
                    span('Null distribution / Type I error'),
                  ]),
                  div('.legend-item', [
                    span('.legend-swatch.legend-swatch--red'),
                    span('True distribution / Type II error'),
                  ]),
                  div('.legend-item', [
                    span('.legend-swatch.legend-swatch--line'),
                    span('Critical boundary'),
                  ]),
                ]),
              ]),

              div('.stats-grid', [
                div('.metric-card', [
                  span('.metric-label', 'Alpha'),
                  span('.metric-value', formatRate(state.computed.typeOneErrorRate)),
                  small('.metric-note', 'Probability of rejecting H0 when H0 is true.'),
                ]),
                div('.metric-card', [
                  span('.metric-label', 'Beta'),
                  span('.metric-value', formatRate(state.computed.typeTwoErrorRate)),
                  small('.metric-note', 'Probability of missing a real effect.'),
                ]),
                div('.metric-card', [
                  span('.metric-label', 'Power'),
                  span('.metric-value', formatRate(state.computed.power)),
                  small('.metric-note', 'Probability of correctly detecting the effect.'),
                ]),
                div('.metric-card', [
                  span('.metric-label', 'Effect Size'),
                  span('.metric-value', formatNumber(state.computed.effectSize)),
                  small('.metric-note', 'Distance between true mean and null mean.'),
                ]),
              ]),

              div('.explanation-card', [
                h3('.explanation-title', 'How to read this view'),
                p(
                  '.explanation-text',
                  'Move the true mean away from the null mean to increase power. Move alpha downward to shrink the rejection region. The best classroom discussions happen when students explain why those two goals can compete.'
                ),
                div('.teaching-callout', [
                  h3('.callout-title', 'Current interpretation'),
                  p('.callout-text', getInterpretation(state)),
                  p('.callout-text.callout-text--secondary', getStrategyTip(state)),
                ]),
                div('.concept-strip', [
                  div('.concept-item', [
                    span('.concept-name', 'H0'),
                    span('.concept-value', state.computed.hypothesisText.H0Text),
                  ]),
                  div('.concept-item', [
                    span('.concept-name', 'H1'),
                    span('.concept-value', state.computed.hypothesisText.H1Text),
                  ]),
                ]),
              ]),
            ]),
          ]),
        ]),
      ])
    );
}
