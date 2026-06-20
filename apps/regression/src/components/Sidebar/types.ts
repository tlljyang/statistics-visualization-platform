import { Stream } from 'xstream';
import type { DOMSource } from '@cycle/dom';
import type { HTTPSource, RequestOptions } from '@cycle/http';
import type { VNode } from '@cycle/dom';
import type { Language } from '@stats-viz/shared/language';

export interface Dataset {
  id: string;
  name: string;
  source?: string;
  xLabel?: string;
  yLabel?: string;
  data: Array<{ x: number; y: number; outlier?: boolean }>;
}

export interface SidebarProps {
  datasetPaths: string[]; // List of dataset file paths to load
}

export interface SidebarSources {
  DOM: DOMSource;
  HTTP: HTTPSource;
  props: Stream<SidebarProps>;
  LANGUAGE: Stream<Language>;
}

export interface SidebarSinks {
  DOM: Stream<VNode>;
  HTTP: Stream<RequestOptions>;
  datasetChange: Stream<string>;
  selectedDataset: Stream<Dataset>;
  toggleRegression: Stream<boolean>;
  toggleOutliers: Stream<boolean>;
  clearCustomLine: Stream<number>;
}

export interface SidebarActions {
  config$: Stream<SidebarProps>; // Props stream as action
  datasetsLoaded$: Stream<Dataset[]>; // HTTP response: loaded datasets
  selectDataset$: Stream<string>;
  toggleRegression$: Stream<null>;
  toggleOutliers$: Stream<null>;
  clearCustomLine$: Stream<null>;
}

export interface SidebarState {
  datasets: Dataset[];
  selectedDataset: string;
  showRegression: boolean;
  showOutliers: boolean;
}

export interface DatasetLoadError {
  id: string;
  error: string;
}
