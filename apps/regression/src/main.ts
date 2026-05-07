import { run } from '@cycle/run';
import { makeDOMDriver } from '@cycle/dom';
import { makeHTTPDriver } from '@cycle/http';
import xs, { Stream } from 'xstream';
import { h } from '@cycle/dom';

// Import Bootstrap CSS from local installation
import 'bootstrap/dist/css/bootstrap.min.css';
// Import custom styles
import './styles/custom.css';
import { Hero } from './components/Hero';
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

  const heroProps$ = xs.of({
    eyebrow: 'Interactive Regression Teaching Site',
    title: 'Teach regression by letting students test ideas visually.',
    description:
      'Start with a dataset, ask students to predict the slope, then compare a hand-drawn line with the least-squares fit.',
    highlights: [
      'Predict the sign of the slope',
      'Compare SSE values',
      'Use residuals to explain fit',
    ],
  });

  const heroSinks = Hero({
    props: heroProps$,
  });

  // ==================== Sidebar Component ====================
  const sidebarProps$ = xs.of({
    datasetPaths: [
      `${dataBaseUrl}data/positive-correlation.json`,
      `${dataBaseUrl}data/negative-correlation.json`,
      `${dataBaseUrl}data/no-correlation.json`,
      `${dataBaseUrl}data/strong-linear.json`,
      `${dataBaseUrl}data/exponential-growth.json`,
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
    .combine(sidebarSinks.selectedDataset, sidebarSinks.toggleRegression)
    .map(([dataset, showRegression]): RegressionChartProps => {
      // Calculate xDomain and yDomain from dataset
      const data = dataset.data;
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
        width: 800,
        height: 600,
        datasets: dataset.data,
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
  const statsPanelProps$ = sidebarSinks.selectedDataset.map(
    (dataset): StatisticsPanelProps => ({
      datasets: dataset.data,
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
      heroSinks.DOM,
      sidebarSinks.DOM,
      chartSinks.DOM,
      statisticsPanelSinks.DOM
    )
    .map(([hero, sidebar, chart, panel]) =>
      h('div.app-container.container-fluid.py-4', {}, [
        h('div.mb-4', [hero]),
        h('div.row.g-4', {}, [
          h(
            'div.sidebar.col-12.col-lg-3',
            { style: { minWidth: '250px' } },
            [sidebar]
          ),
          h('div.chart-area.col-12.col-lg-9.p-3.d-flex.flex-column', {}, [
            h(
              'div.chart-wrapper.flex-grow-1.d-flex.align-items-center.justify-content-center.bg-white.border.rounded-4.shadow-sm.p-3',
              { style: { minHeight: '0' } },
              [chart]
            ),
            h('div.panel-wrapper.mt-3', { style: { flexShrink: '0' } }, [
              panel,
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
  const dataBaseUrl = import.meta.env.BASE_URL;
