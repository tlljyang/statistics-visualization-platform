import xs, { Stream } from 'xstream';
import type {
  SidebarProps,
  SidebarActions,
  SidebarState,
  Dataset,
} from './types';
import type { RequestOptions } from '@cycle/http';

type DataPoint = Dataset['data'][number];

function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function annotateDatasetOutliers(dataset: Dataset): Dataset {
  if (dataset.data.some((point) => point.outlier)) {
    return dataset;
  }

  if (dataset.data.length < 8) {
    return dataset;
  }

  const xValues = dataset.data.map((point) => point.x);
  const yValues = dataset.data.map((point) => point.y);
  const xMean = mean(xValues);
  const yMean = mean(yValues);
  const sxx = xValues.reduce((sum, x) => sum + (x - xMean) ** 2, 0);

  if (sxx <= Number.EPSILON) {
    return dataset;
  }

  const sxy = dataset.data.reduce(
    (sum, point) => sum + (point.x - xMean) * (point.y - yMean),
    0
  );
  const slope = sxy / sxx;
  const intercept = yMean - slope * xMean;
  const residuals = dataset.data.map(
    (point) => point.y - (intercept + slope * point.x)
  );
  const mse =
    residuals.reduce((sum, residual) => sum + residual ** 2, 0) /
    Math.max(dataset.data.length - 2, 1);

  if (!Number.isFinite(mse) || mse <= Number.EPSILON) {
    return dataset;
  }

  const rmse = Math.sqrt(mse);
  const influenceCutoff = 4 / dataset.data.length;
  const annotatedData = dataset.data.map((point, index): DataPoint => {
    const leverage =
      1 / dataset.data.length + ((point.x - xMean) ** 2) / sxx;
    const leverageSafe = Math.min(0.999999, leverage);
    const studentizedResidual =
      Math.abs(residuals[index]) /
      (rmse * Math.sqrt(Math.max(1 - leverageSafe, 1e-9)));
    const cooksDistance =
      (residuals[index] ** 2 / (2 * mse)) *
      (leverageSafe / Math.max((1 - leverageSafe) ** 2, 1e-9));
    const isOutlier =
      studentizedResidual >= 2.5 ||
      (studentizedResidual >= 2 && cooksDistance > influenceCutoff);

    return isOutlier ? { ...point, outlier: true } : point;
  });

  return {
    ...dataset,
    data: annotatedData
  };
}

export function model(actions: SidebarActions): Stream<SidebarState> {
  // Config stream: initial state setup (only runs once per config emission)
  const configState$ = actions.config$.map(
    (_props: SidebarProps) => (state: SidebarState) => {
      // Only initialize if state is still initial (empty datasets)
      if (state.datasets.length === 0) {
        return {
          ...state,
          showRegression: true,
          showOutliers: true,
        };
      }
      // Otherwise keep state as-is (don't reset showRegression)
      return state;
    }
  );

  // Datasets loaded action: replaces datasets in state
  const datasetsLoadedPatch$ = actions.datasetsLoaded$.map(
    (datasets: Dataset[]) => (state: SidebarState) => ({
      ...state,
      datasets: datasets.map(annotateDatasetOutliers),
      selectedDataset:
        datasets.length > 0 ? datasets[0].id : state.selectedDataset,
    })
  );

  // Dataset selection action
  const datasetPatch$ = actions.selectDataset$.map(
    (selectedDataset: string) => (state: SidebarState) => ({
      ...state,
      selectedDataset,
    })
  );

  // Toggle regression action
  const regressionPatch$ = actions.toggleRegression$.map(
    () => (state: SidebarState) => ({
      ...state,
      showRegression: !state.showRegression,
    })
  );

  const outlierPatch$ = actions.toggleOutliers$.map(
    () => (state: SidebarState) => ({
      ...state,
      showOutliers: !state.showOutliers,
    })
  );

  // Clear custom line action (state unchanged, just emits signal)
  const clearSignal$ = actions.clearCustomLine$.map(
    () => (state: SidebarState) => state
  );

  // Merge all state updates
  const stateUpdate$ = xs.merge(
    configState$,
    datasetsLoadedPatch$,
    datasetPatch$,
    regressionPatch$,
    outlierPatch$,
    clearSignal$
  );

  // Initial state
  const initialState: SidebarState = {
    datasets: [],
    selectedDataset: '',
    showRegression: true,
    showOutliers: true,
  };

  // Apply all updates using fold
  return stateUpdate$.fold(
    (state: SidebarState, updateFn: (state: SidebarState) => SidebarState) =>
      updateFn(state),
    initialState
  );
}

// Sink creators for component outputs
export function createDatasetChangeSink(
  selectDataset$: Stream<string>
): Stream<string> {
  return selectDataset$;
}

export function createSelectedDatasetSink(
  _selectDataset$: Stream<string>,
  state$: Stream<SidebarState>
): Stream<Dataset> {
  // Emit whenever state changes with a valid dataset (initial + changes)
  return state$
    .map((state) => {
      const dataset = state.datasets.find(
        (d) => d.id === state.selectedDataset
      );
      if (!dataset) {
        if (state.datasets.length > 0) {
          console.warn(
            '[Sidebar] Selected dataset not found, returning first dataset'
          );
          return state.datasets[0];
        }
        return undefined;
      }
      return dataset;
    })
    .filter((dataset): dataset is Dataset => dataset !== undefined);
}

export function createToggleRegressionSink(
  toggleRegression$: Stream<null>,
  state$: Stream<SidebarState>
): Stream<boolean> {
  // Emit current state whenever toggle is clicked, with initial emission
  return toggleRegression$
    .map(() => state$)
    .flatten()
    .map((state) => state.showRegression)
    .startWith(true);
}

export function createToggleOutliersSink(
  toggleOutliers$: Stream<null>,
  state$: Stream<SidebarState>
): Stream<boolean> {
  return toggleOutliers$
    .map(() => state$)
    .flatten()
    .map((state) => state.showOutliers)
    .startWith(true);
}

export function createClearCustomLineSink(
  clearCustomLine$: Stream<null>
): Stream<number> {
  return clearCustomLine$.map(() => Date.now());
}

// Create HTTP requests sink
export function createHTTPSink(
  actions: SidebarActions
): Stream<RequestOptions> {
  const request$ = actions.config$
    .map((props: SidebarProps) => {
      console.log(
        '[HTTP Sink] Creating requests for',
        props.datasetPaths.length,
        'datasets'
      );
      // Create individual request streams and merge them
      const requestStreams = props.datasetPaths.map((path: string) => {
        console.log('[HTTP Sink] Creating request for:', path);
        return xs.of({
          url: path,
          method: 'GET',
          category: 'datasets',
        } as RequestOptions);
      });
      const merged = xs.merge(...requestStreams);
      return merged;
    })
    .flatten();

  // Debug: log what's being emitted
  request$.addListener({
    next: (req: RequestOptions) =>
      console.log('[HTTP Sink] Emitting request:', req.url),
    error: (err) => console.error('[HTTP Sink] Error:', err),
    complete: () => console.log('[HTTP Sink] Stream complete'),
  });

  return request$;
}
