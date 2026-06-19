import type {
  ChartBar,
  ChartPoint,
  ControlValue,
  ExampleConfig,
  SimulationResult,
} from "../components/SimulationCltApp/types";
import { createRandom, exponentialRandom, normalRandom } from "../utils/random";
import { formatNumber, mean, standardDeviation } from "../utils/format";

type ControlMap = Record<string, ControlValue>;

function num(controls: ControlMap, id: string, fallback: number): number {
  const value = controls[id];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function str(controls: ControlMap, id: string, fallback: string): string {
  const value = controls[id];
  return typeof value === "string" ? value : fallback;
}

function drawPopulationValue(rng: () => number, shape: string): number {
  if (shape === "normal") {
    return normalRandom(rng, 0, 1);
  }

  if (shape === "uniform") {
    return rng() * 2 * Math.sqrt(3) - Math.sqrt(3);
  }

  if (shape === "bimodal") {
    return rng() < 0.5 ? normalRandom(rng, -1.35, 0.45) : normalRandom(rng, 1.35, 0.45);
  }

  if (shape === "skewed") {
    return (exponentialRandom(rng, 1.25) - 0.8) * 1.25;
  }

  return exponentialRandom(rng, 1) - 1;
}

function histogram(values: number[], count = 18, domain?: [number, number]): ChartBar[] {
  const min = domain?.[0] ?? values.reduce((a, b) => Math.min(a, b), Infinity);
  const max = domain?.[1] ?? values.reduce((a, b) => Math.max(a, b), -Infinity);
  const width = (max - min || 1) / count;
  const bins = Array.from({ length: count }, (_, index) => ({
    label: formatNumber(min + width * (index + 0.5), 2),
    value: 0,
  }));

  for (const value of values) {
    if (value < min || value > max) continue;
    const index = Math.min(count - 1, Math.max(0, Math.floor((value - min) / width)));
    bins[index].value += 1;
  }

  return bins;
}

function normalPdf(x: number, mu: number, sd: number): number {
  return Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
}

function populationForShape(shape: string): number[] {
  const rng = createRandom(937 + shape.length * 97);
  return Array.from({ length: 2500 }, () => drawPopulationValue(rng, shape));
}

export function generateSampleMeans(
  controls: ControlMap,
  count: number,
  seed: number
): number[] {
  const shape = str(controls, "populationShape", "exponential");
  const sampleSize = Math.max(1, Math.round(num(controls, "sampleSize", 5)));
  const rng = createRandom(seed);

  return Array.from({ length: count }, () => {
    const sample = Array.from({ length: sampleSize }, () =>
      drawPopulationValue(rng, shape)
    );
    return mean(sample);
  });
}

function result(
  headline: string,
  narrative: string,
  metrics: SimulationResult["metrics"],
  chart: SimulationResult["chart"]
): SimulationResult {
  return { headline, narrative, metrics, chart };
}

export function runExample(
  _example: ExampleConfig,
  controls: ControlMap,
  seed: number,
  _data?: unknown,
  sampleMeans: number[] = []
): SimulationResult {
  const shape = str(controls, "populationShape", "exponential");
  const sampleSize = Math.max(1, Math.round(num(controls, "sampleSize", 5)));
  const population = populationForShape(shape);
  const populationMean = mean(population);
  const populationSd = standardDeviation(population);
  const standardError = populationSd / Math.sqrt(sampleSize);
  const shownMeans = sampleMeans.length ? sampleMeans : generateSampleMeans(controls, 20, seed);
  const samplingDomain: [number, number] = [
    populationMean - Math.max(3.2 * standardError, 0.55),
    populationMean + Math.max(3.2 * standardError, 0.55),
  ];
  const binCount = 18;
  const binWidth = (samplingDomain[1] - samplingDomain[0]) / binCount;
  const curvePoints: ChartPoint[] = Array.from({ length: 80 }, (_, index) => {
    const x = samplingDomain[0] + (index / 79) * (samplingDomain[1] - samplingDomain[0]);
    return {
      x,
      y: normalPdf(x, populationMean, Math.max(standardError, 1e-6)) * binWidth * Math.max(shownMeans.length, 1),
    };
  });

  return result(
    "Sampling distribution of sample means",
    "Draw repeated samples, then compare the histogram of sample means with the normal approximation predicted by the CLT.",
    [
      { label: "samples drawn", value: String(shownMeans.length), detail: "sample means in histogram" },
      { label: "sample size n", value: String(sampleSize), detail: "observations per sample" },
      { label: "population mean", value: formatNumber(populationMean, 3), detail: "estimated from preview population" },
      { label: "theoretical SE", value: formatNumber(standardError, 4), detail: "sigma / sqrt(n)" },
      {
        label: "observed SD",
        value: shownMeans.length > 1 ? formatNumber(standardDeviation(shownMeans), 4) : "n/a",
        detail: "SD of sample means"
      },
    ],
    {
      type: "clt",
      title: "Central Limit Theorem simulation",
      populationTitle: `Population distribution: ${shape}`,
      samplingTitle: "Sampling distribution of sample means",
      xLabel: "Value",
      yLabel: "Count",
      populationBars: histogram(population, 24),
      sampleMeanBars: histogram(shownMeans, binCount, samplingDomain),
      normalCurve: curvePoints,
      populationMean,
      latestMean: shownMeans.at(-1),
      xDomain: samplingDomain,
    }
  );
}
