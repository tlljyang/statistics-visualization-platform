import type { Stream } from "xstream";
import type { DOMSource, VNode } from "@cycle/dom";
import type { TemplateCopy } from "@stats-viz/shared/i18n";
import type { Language } from "@stats-viz/shared/language";

export type ControlValue = number | string;
export type ControlType = "number" | "select" | "text";

export interface SelectOption {
  value: string;
  label: string;
}

export interface ControlConfig {
  id: string;
  label: string;
  type: ControlType;
  defaultValue: ControlValue;
  min?: number;
  max?: number;
  step?: number;
  options?: SelectOption[];
}

export interface ExampleConfig {
  id: string;
  title: string;
  kind: string;
  sourcePath: string;
  description: string;
  teachingPoints: string[];
  controls: ControlConfig[];
}

export interface ModuleConfig {
  id: string;
  repoName: string;
  title: string;
  subtitle: string;
  category: string;
  sourcePath: string;
  examples: ExampleConfig[];
  data?: {
    cities?: CityRecord[];
  };
}

export interface CityRecord {
  city: string;
  GDP: number;
  completed: number;
  planning: number;
}

export interface Metric {
  label: string;
  value: string;
  detail?: string;
}

export interface ChartPoint {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

export interface ChartSeries {
  label: string;
  points: ChartPoint[];
  color?: string;
}

export interface ChartBar {
  label: string;
  value: number;
  color?: string;
}

export interface ChartInterval {
  label: string;
  center: number;
  lower: number;
  upper: number;
  color?: string;
}

export type ChartSpec =
  | { type: "scatter"; title: string; xLabel: string; yLabel: string; points: ChartPoint[]; line?: ChartSeries; xDomain?: [number, number]; yDomain?: [number, number] }
  | { type: "line"; title: string; xLabel: string; yLabel: string; series: ChartSeries[]; xDomain?: [number, number]; yDomain?: [number, number] }
  | { type: "bars"; title: string; xLabel: string; yLabel: string; bars: ChartBar[]; yDomain?: [number, number] }
  | { type: "intervals"; title: string; xLabel: string; yLabel: string; intervals: ChartInterval[]; reference?: number; xDomain?: [number, number] };

export interface TableSpec {
  columns: string[];
  rows: Array<Array<string | number>>;
}

export interface SimulationResult {
  headline: string;
  narrative: string;
  metrics: Metric[];
  chart: ChartSpec;
  table?: TableSpec;
}

export interface State {
  language: Language;
  copy: TemplateCopy;
  config: ModuleConfig;
  activeExample: ExampleConfig;
  controls: Record<string, ControlValue>;
  seed: number;
  result: SimulationResult;
}

export interface Sources {
  DOM: DOMSource;
}

export interface Sinks {
  DOM: Stream<VNode>;
}

export interface Actions {
  selectExample$: Stream<string>;
  updateControl$: Stream<{ id: string; value: ControlValue }>;
  addSamples$: Stream<number>;
  runSimulation$: Stream<number>;
}
