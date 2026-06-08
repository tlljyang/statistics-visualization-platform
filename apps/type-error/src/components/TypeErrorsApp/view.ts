import xs, { Stream } from 'xstream';
import type { VNode } from '@cycle/dom';
import { div, h, h1, h2, h3, p, span, small } from '@cycle/dom';
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
      div('.module-shell', [
        div('.module-layout', [
          div('.experiment-board', [
            div('.experiment-header', [
              div([
                p('.eyebrow', 'Core Visualizer'),
                h1('Type I / II Error'),
                p('Adjust alpha, move the true mean, and watch rejection regions, beta, and power update together.'),
              ]),
            ]),
            div('.output-dock', [
              div('.output-heading', [
                p('.eyebrow', 'Model output'),
                h2('Decision regions and overlapping distributions'),
                p('The blue curve represents the null hypothesis, the red curve the true distribution, and the shaded regions show the two kinds of error.'),
              ]),
              div('.chart-frame', [chart]),
            ]),
            div('.metrics-grid', [
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
          ]),
          div('.teaching-area', [
            div('.teaching-panel.parameter-panel', [
              p('.eyebrow', 'Parameters'),
              div('.test-type-tabs', [
                div('.test-type-tabs__label', 'Hypothesis'),
                div('.test-type-tabs__buttons', [
                  h('button.test-type-tab', {
                    attrs: {
                      type: 'button',
                      'data-test-type': 'right-tailed',
                      'data-active': String(state.config.testType === 'right-tailed'),
                    },
                  }, 'One-sided'),
                  h('button.test-type-tab', {
                    attrs: {
                      type: 'button',
                      'data-test-type': 'two-tailed',
                      'data-active': String(state.config.testType === 'two-tailed'),
                    },
                  }, 'Two-sided'),
                ]),
              ]),
              panel,
            ]),
            div('.teaching-panel', [
              p('.eyebrow', 'Concept + key idea'),
              h2('Two kinds of error'),
              p('A Type I error rejects a true null hypothesis. A Type II error fails to reject the null when a real effect exists.'),
              h3('Alpha and power trade off'),
              p(getInterpretation(state)),
              p(getStrategyTip(state)),
            ]),
            div('.teaching-panel', [
              p('.eyebrow', 'Formula'),
              div('.latex-formula', [
                div('.math-expression', [
                  span('Power = 1 −'),
                  span('.math-symbol', 'β'),
                ]),
              ]),
              p(`Current test: ${state.config.testType.replace('-', ' ')}. Critical value: ${getCriticalValueLabel(state)}.`),
            ]),
            div('.teaching-panel', [
              p('.eyebrow', 'How to read this'),
              h3('Current hypotheses'),
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
      ])
    );
}
