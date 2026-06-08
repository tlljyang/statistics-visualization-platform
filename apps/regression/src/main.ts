import { run } from '@cycle/run';
import { makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';
import xs, { Stream } from 'xstream';
import { h } from '@cycle/dom';

import './styles/custom.css';
import { getRegressionDataBaseUrl } from './dataBaseUrl';
import { Sidebar } from './components/Sidebar';
import { RegressionChart } from './components/RegressionChart';
import { StatisticsPanel } from './components/StatisticsPanel';
import type { RegressionChartProps } from './components/RegressionChart/types';
import type { StatisticsPanelProps } from './components/StatisticsPanel/types';
import type { DOMSource, VNode } from '@cycle/dom';
import type { HTTPSource, RequestOptions } from '@cycle/http';

interface MainSources {
  DOM: DOMSource;
  HTTP: HTTPSource;
}

interface MainSinks {
  DOM: Stream<VNode>;
  HTTP: Stream<RequestOptions>;
}

function main(sources: MainSources): MainSinks {
  console.log(
    '[main] main() called - Sidebar + RegressionChart + StatisticsPanel composition'
  );

  const dataBaseUrl = getRegressionDataBaseUrl(
    window.location.pathname,
    import.meta.env.BASE_URL,
    import.meta.env.DEV
  );

  // ==================== Sidebar Component ====================
  const sidebarProps$ = xs.of({
    datasetPaths: [
      `${dataBaseUrl}data/outlier-impact.json`,
      `${dataBaseUrl}data/positive-correlation.json`,
      `${dataBaseUrl}data/negative-correlation.json`,
      `${dataBaseUrl}data/no-correlation.json`,
      `${dataBaseUrl}data/strong-linear.json`,
      `${dataBaseUrl}data/exponential-growth.json`,
      `${dataBaseUrl}data/textbook/chapter-8-height-exercise-hours.json`,
      `${dataBaseUrl}data/textbook/chapter-8-height-latitude.json`,
      `${dataBaseUrl}data/textbook/chapter-8-height-father-height.json`,
      `${dataBaseUrl}data/textbook/chapter-8-height-mother-height.json`,
      `${dataBaseUrl}data/textbook/chapter-8-height-sleep-hours.json`,
      `${dataBaseUrl}data/textbook/chapter-8-skyscrapers-built-gdp.json`,
      `${dataBaseUrl}data/textbook/chapter-8-skyscrapers-planned-gdp.json`,
      `${dataBaseUrl}data/textbook/chapter-8-us-population-year.json`,
      `${dataBaseUrl}data/textbook/chapter-8-book-spending-education.json`,
      `${dataBaseUrl}data/textbook/chapter-8-book-spending-income.json`,
      `${dataBaseUrl}data/textbook/chapter-8-tourism-gdp.json`,
      `${dataBaseUrl}data/textbook/chapter-8-tourism-restaurants.json`,
      `${dataBaseUrl}data/textbook/chapter-8-tourism-hotels.json`,
      `${dataBaseUrl}data/textbook/chapter-8-tourism-roads.json`,
      `${dataBaseUrl}data/textbook/chapter-8-tourism-universities.json`,
      `${dataBaseUrl}data/textbook/chapter-8-tourism-service-workers.json`,
    ],
  });

  const sidebarSinks = Sidebar({
    DOM: sources.DOM,
    HTTP: sources.HTTP,
    props: sidebarProps$,
  });

  // ==================== RegressionChart Component ====================
  // Merge clear signals: from manual button click + automatic on dataset change
  const clearSignal$ = xs.merge(
    sidebarSinks.clearCustomLine,
    sidebarSinks.datasetChange.mapTo(Date.now())
  );

  // Combine Sidebar sinks to create RegressionChart props
  const chartProps$ = xs
    .combine(sidebarSinks.selectedDataset, sidebarSinks.toggleRegression, sidebarSinks.toggleOutliers)
    .map(([dataset, showRegression, showOutliers]): RegressionChartProps => {
      // Calculate xDomain and yDomain from dataset
      const data = showOutliers ? dataset.data : dataset.data.filter((point) => !point.outlier);
      let xMin = 0,
        xMax = 0,
        yMin = 0,
        yMax = 0;

      if (data.length > 0) {
        const xValues = data.map((d) => d.x);
        const yValues = data.map((d) => d.y);
        xMin = Math.min(...xValues);
        xMax = Math.max(...xValues);
        yMin = Math.min(...yValues);
        yMax = Math.max(...yValues);

        // Add padding to the domains (10% on each side)
        const xPadding = (xMax - xMin) * 0.1 || 1;
        const yPadding = (yMax - yMin) * 0.1 || 1;
        xMin -= xPadding;
        xMax += xPadding;
        yMin -= yPadding;
        yMax += yPadding;
      }

      return {
        width: 860,
        height: 520,
        margins: { top: 34, right: 34, bottom: 58, left: 64 },
        datasets: data,
        xDomain: [xMin, xMax],
        yDomain: [yMin, yMax],
        showRegression: showRegression,
        clearLineSignal: clearSignal$.map((n: number): number | null => n),
      };
    });

  const chartSinks = RegressionChart({
    DOM: sources.DOM,
    props: chartProps$,
  });

  // ==================== StatisticsPanel Component ====================
  // Create props stream for StatisticsPanel from the dataset data
  const statsPanelProps$ = xs.combine(sidebarSinks.selectedDataset, sidebarSinks.toggleOutliers).map(
    ([dataset, showOutliers]): StatisticsPanelProps => ({
      datasets: showOutliers ? dataset.data : dataset.data.filter((point) => !point.outlier),
    })
  );

  const statisticsPanelSinks = StatisticsPanel({
    DOM: sources.DOM,
    props: statsPanelProps$,
    customLine: chartSinks.customLine,
    regression: chartSinks.regression,
    pointHover: chartSinks.pointHover,
  });

  // ==================== Render ====================
  const vdom$ = xs
    .combine(
      sidebarSinks.DOM,
      chartSinks.DOM,
      statisticsPanelSinks.DOM
    )
    .map(([sidebar, chart, panel]) =>
      h('div.module-shell', {}, [
        h('main.module-layout', {}, [
          h('section.experiment-board', {}, [
            h('header.experiment-header', {}, [
              h('div', {}, [
                h('p.eyebrow', 'Core Visualizer'),
                h('h1', 'Regression'),
                h(
                  'p',
                  'Choose a dataset, draw a custom line, and compare it with the least-squares regression fit.'
                ),
              ]),
            ]),
            h('section.output-dock', {}, [
              h('div.output-heading', {}, [
                h('p.eyebrow', 'Model output'),
                h('h2', 'Scatterplot and fitted lines'),
                h(
                  'p',
                  'Click and drag on the graph to draw a custom line, then compare it with the regression line.'
                ),
              ]),
              h('div.chart-frame', {}, [h('div.chart-shell', {}, [chart])]),
            ]),
            h('section.metrics-grid', {}, [panel]),
          ]),
          h('aside.teaching-area', {}, [
            h('section.teaching-panel.parameter-panel', {}, [
              h('p.eyebrow', 'Parameters'),
              sidebar,
            ]),
            h('section.teaching-panel', {}, [
              h('p.eyebrow', 'Concept + key idea'),
              h('h2', 'Least-squares regression'),
              h(
                'p',
                'Regression uses a line to describe the relationship between an explanatory variable and a response variable.'
              ),
              h('h3', 'Residuals explain fit'),
              h(
                'p',
                'The least-squares line is the line that minimizes the sum of squared residuals across the dataset.'
              ),
            ]),
            h('section.teaching-panel', {}, [
              h('p.eyebrow', 'Formula'),
              h('div.latex-formula', {}, [
                h('div.math-expression', {}, [
                  h('span', 'SSE ='),
                  h('span.math-symbol', 'Σ'),
                  h('span', ['(', 'y', h('sub', 'i'), ' − ', 'ŷ', h('sub', 'i'), ')']),
                  h('sup', '2'),
                ]),
              ]),
              h('p', 'Compare the custom line and regression line by watching how SSE changes.'),
            ]),
            h('section.teaching-panel', {}, [
              h('p.eyebrow', 'Teaching notes'),
              h('h3', 'Classroom focus'),
              h(
                'p',
                'Ask students to predict the slope first, draw their line, and then use residuals to explain why one line fits better.'
              ),
            ]),
          ]),
        ]),
      ])
    );

  return {
    DOM: vdom$,
    HTTP: sidebarSinks.HTTP,
  };
}

// Run the application
run(main, {
  DOM: makeDOMDriver('#main-container'),
  HTTP: makeHTTPDriver(),
});
