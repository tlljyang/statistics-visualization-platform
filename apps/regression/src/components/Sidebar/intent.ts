import xs, { Stream } from 'xstream';
import { $el } from '../../_utils/dom';
import type { SidebarSources, SidebarActions, Dataset } from './types';
import type { Response } from '@cycle/http';

export function intent(sources: SidebarSources): SidebarActions {
  // Props stream as config action
  const config$ = sources.props;

  // HTTP responses: datasets loaded
  const responseStreams$ = sources.HTTP.select('datasets');

  // Debug: log how many response streams we get
  responseStreams$.addListener({
    next: (response$: Stream<Response>) => {
      console.log('[Sidebar intent] Got response stream:', response$);
      response$.addListener({
        next: (res: Response) => {
          console.log('[Sidebar intent] Response stream emitted:', res);
        },
      });
    },
  });

  // Collect all response streams into an array, then process them
  const allResponseStreams$ = responseStreams$
    .fold((acc: Stream<Response>[], rs: Stream<Response>) => [...acc, rs], [])
    .map((streams: Stream<Response>[]) => {
      console.log(
        '[Sidebar intent] Collected',
        streams.length,
        'response streams'
      );
      return streams;
    });

  const datasetsLoaded$ = allResponseStreams$
    .map((streams: Stream<Response>[]) => {
      // Process each response stream
      const datasetStreams = streams.map((response$: Stream<Response>) =>
        response$.map((res: Response) => {
          // Log response details for debugging
          console.log('[Sidebar intent] HTTP Response:', {
            url: res.request?.url || 'unknown',
            status: res.status,
            body: res.body,
            text: res.text || 'N/A',
            raw: res,
          });

          // Only process successful responses
          if (res.status !== 200) {
            console.error('[Sidebar intent] HTTP Error:', {
              url: res.request?.url || 'unknown',
              status: res.status,
            });
            return null as Dataset | null;
          }

          // Try to get the dataset from various possible response formats
          let dataset: Dataset | null = null;

          if (res.body) {
            dataset = res.body as Dataset;
          } else if (res.text) {
            try {
              dataset = JSON.parse(res.text) as Dataset;
            } catch (e) {
              console.error(
                '[Sidebar intent] Failed to parse response text:',
                e
              );
            }
          }

          if (!dataset) {
            console.warn(
              '[Sidebar intent] Could not extract dataset from response'
            );
            return null;
          }

          console.log(
            '[Sidebar intent] Successfully parsed dataset:',
            dataset.id
          );
          return dataset;
        })
      );
      return xs.merge(...datasetStreams);
    })
    .flatten()
    .filter((dataset): dataset is Dataset => dataset !== null)
    .fold((acc: Dataset[], dataset: Dataset) => [...acc, dataset], [])
    .map((datasets: Dataset[]) => {
      console.log('[Sidebar intent] All datasets loaded:', datasets.length);
      return datasets;
    });

  // Dataset selection from dropdown
  const selectDataset$ = $el(sources.DOM, '.dataset-select')
    .events('change')
    .map((ev: Event) => (ev.target as HTMLSelectElement).value);

  // Toggle regression checkbox
  const toggleRegression$ = $el(sources.DOM, '.regression-toggle')
    .events('change')
    .mapTo(null as null);

  const toggleOutliers$ = $el(sources.DOM, '.outlier-toggle')
    .events('change')
    .mapTo(null as null);

  // Clear custom line button
  const clearCustomLine$ = $el(sources.DOM, '.clear-custom-line')
    .events('click')
    .mapTo(null as null);

  return {
    config$,
    datasetsLoaded$,
    selectDataset$,
    toggleRegression$,
    toggleOutliers$,
    clearCustomLine$,
  };
}
