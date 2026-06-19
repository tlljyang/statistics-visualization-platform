import type { ChartBar, ChartPoint, ChartSeries, CityRecord, ControlValue, ExampleConfig, SimulationResult, TableSpec } from "../components/SimulationVarianceReductionApp/types";
import { createRandom, exponentialRandom, normalRandom, sampleWithReplacement } from "../utils/random";
import { formatNumber, mean, parseNumberList, quantile, standardDeviation, variance } from "../utils/format";

type ControlMap = Record<string, ControlValue>;

function num(controls: ControlMap, id: string, fallback: number): number {
  const value = controls[id];
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function str(controls: ControlMap, id: string, fallback: string): string {
  const value = controls[id];
  return typeof value === "string" ? value : fallback;
}

function histogram(values: number[], count = 18): ChartBar[] {
  const min = values.reduce((a, b) => Math.min(a, b), Infinity);
  const max = values.reduce((a, b) => Math.max(a, b), -Infinity);
  const width = (max - min || 1) / count;
  const bins = Array.from({ length: count }, (_, index) => ({
    label: formatNumber(min + width * (index + 0.5), 2),
    value: 0
  }));

  for (const value of values) {
    const index = Math.min(count - 1, Math.max(0, Math.floor((value - min) / width)));
    bins[index].value += 1;
  }

  return bins;
}

function normalPdf(x: number, mu = 0, sd = 1): number {
  return Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
}

function erf(x: number): number {
  const sign = Math.sign(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;
  const absX = Math.abs(x);
  const t = 1 / (1 + p * absX);
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

function normalCdf(x: number, mu = 0, sd = 1): number {
  return 0.5 * (1 + erf((x - mu) / (sd * Math.sqrt(2))));
}

function linearRegression(points: Array<{ x: number; y: number }>) {
  const xMean = mean(points.map((point) => point.x));
  const yMean = mean(points.map((point) => point.y));
  const sxx = points.reduce((sum, point) => sum + (point.x - xMean) ** 2, 0);
  const sxy = points.reduce((sum, point) => sum + (point.x - xMean) * (point.y - yMean), 0);
  const slope = sxy / sxx;
  const intercept = yMean - slope * xMean;
  const fitted = points.map((point) => intercept + slope * point.x);
  const sst = points.reduce((sum, point) => sum + (point.y - yMean) ** 2, 0);
  const sse = points.reduce((sum, point, index) => sum + (point.y - fitted[index]) ** 2, 0);
  const rSquared = 1 - sse / sst;

  return { slope, intercept, rSquared, sse };
}

function result(
  headline: string,
  narrative: string,
  metrics: SimulationResult["metrics"],
  chart: SimulationResult["chart"],
  table?: TableSpec
): SimulationResult {
  return { headline, narrative, metrics, chart, table };
}

function piCircle(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.min(10000, Math.max(100, Math.round(num(controls, "points", 1000))));
  let inside = 0;
  const points: ChartPoint[] = [];
  for (let i = 0; i < n; i += 1) {
    const x = rng() * 2 - 1;
    const y = rng() * 2 - 1;
    const hit = x * x + y * y <= 1;
    if (hit) inside += 1;
    if (i < 1200) points.push({ x, y, color: hit ? "#136f63" : "#d1495b" });
  }
  const estimate = 4 * inside / n;
  return result(
    "Circle-area Monte Carlo estimate",
    "The chart displays a capped preview of simulated points; the metrics use all generated points.",
    [
      { label: "pi estimate", value: formatNumber(estimate, 5), detail: "4 x inside proportion" },
      { label: "inside points", value: String(inside), detail: `${n} total draws` },
      { label: "absolute error", value: formatNumber(Math.abs(Math.PI - estimate), 5), detail: "Compared with Math.PI" }
    ],
    { type: "scatter", title: "Random points in the unit square", xLabel: "x", yLabel: "y", points, xDomain: [-1, 1], yDomain: [-1, 1] }
  );
}

function buffon(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const trials = Math.max(100, Math.round(num(controls, "trials", 1000)));
  const experiments = Math.max(1, Math.round(num(controls, "experiments", 20)));
  const planeWidth = Math.max(1, num(controls, "planeWidth", 6));
  const needleLength = Math.min(1, planeWidth);
  const estimates: ChartPoint[] = [];
  let totalCrosses = 0;
  for (let experiment = 1; experiment <= experiments; experiment += 1) {
    let crosses = 0;
    for (let i = 0; i < trials; i += 1) {
      const centerDistance = rng() * (planeWidth / 2);
      const theta = rng() * Math.PI;
      if (centerDistance <= (needleLength / 2) * Math.sin(theta)) crosses += 1;
    }
    totalCrosses += crosses;
    const probability = totalCrosses / (trials * experiment);
    estimates.push({ x: experiment, y: probability > 0 ? (2 * needleLength) / (planeWidth * probability) : 0 });
  }
  const final = estimates.at(-1)?.y ?? 0;
  return result(
    "Buffon's needle convergence",
    "Each point is the cumulative pi estimate after another experiment.",
    [
      { label: "pi estimate", value: formatNumber(final, 5), detail: "Cumulative estimate" },
      { label: "crossing rate", value: formatNumber(totalCrosses / (trials * experiments), 4), detail: "Needles crossing a line" },
      { label: "experiments", value: String(experiments), detail: `${trials} trials each` }
    ],
    { type: "line", title: "Cumulative estimate by experiment", xLabel: "experiment", yLabel: "pi estimate", series: [{ label: "estimate", points: estimates, color: "#136f63" }], yDomain: [0, Math.max(5, final * 1.2)] }
  );
}

function randomNormal(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const targetMean = num(controls, "mean", 0);
  const sd = Math.max(0.1, num(controls, "sd", 1));
  const sample = Array.from({ length: n }, () => normalRandom(rng, targetMean, sd));
  return result(
    "Generated normal sample",
    "Histogram bins show the simulated distribution around the requested mean and standard deviation.",
    [
      { label: "sample mean", value: formatNumber(mean(sample), 4), detail: `target ${formatNumber(targetMean, 2)}` },
      { label: "sample sd", value: formatNumber(standardDeviation(sample), 4), detail: `target ${formatNumber(sd, 2)}` },
      { label: "sample size", value: String(n), detail: "Box-Muller draws" }
    ],
    { type: "bars", title: "Normal sample histogram", xLabel: "bin center", yLabel: "count", bars: histogram(sample) }
  );
}

function randomExponential(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const lambda = Math.max(0.1, num(controls, "lambda", 2));
  const sample = Array.from({ length: n }, () => exponentialRandom(rng, lambda));
  return result(
    "Generated exponential sample",
    "The histogram displays right-skew and tail length controlled by lambda.",
    [
      { label: "sample mean", value: formatNumber(mean(sample), 4), detail: `theory ${formatNumber(1 / lambda, 4)}` },
      { label: "sample sd", value: formatNumber(standardDeviation(sample), 4), detail: `theory ${formatNumber(1 / lambda, 4)}` },
      { label: "lambda", value: formatNumber(lambda, 3), detail: "rate parameter" }
    ],
    { type: "bars", title: "Exponential sample histogram", xLabel: "bin center", yLabel: "count", bars: histogram(sample) }
  );
}

function gammaRejection(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1500)));
  const alpha = Math.max(0.2, num(controls, "alpha", 1.5));
  const beta = Math.max(0.2, num(controls, "beta", 1));
  const lambda = Math.max(0.1, num(controls, "lambda", 0.6667));
  const envelope = Math.max(0.5, num(controls, "envelope", 1.258));
  const accepted: number[] = [];
  for (let i = 0; i < n; i += 1) {
    const proposal = exponentialRandom(rng, lambda);
    const targetShape = Math.pow(proposal, alpha - 1) * Math.exp(-beta * proposal);
    const proposalShape = lambda * Math.exp(-lambda * proposal);
    if (rng() <= Math.min(1, targetShape / Math.max(envelope * proposalShape, Number.EPSILON))) {
      accepted.push(proposal);
    }
  }
  return result(
    "Acceptance-rejection preview",
    "Accepted proposal draws form an empirical gamma-like sample.",
    [
      { label: "accepted", value: String(accepted.length), detail: `${n} candidates` },
      { label: "acceptance rate", value: formatNumber(accepted.length / n, 4), detail: "accepted / candidates" },
      { label: "accepted mean", value: formatNumber(mean(accepted.length ? accepted : [0]), 4), detail: `gamma mean approx ${formatNumber(alpha / beta, 4)}` }
    ],
    { type: "bars", title: "Accepted sample histogram", xLabel: "bin center", yLabel: "count", bars: histogram(accepted.length ? accepted : [0]) }
  );
}

function mcIntegralExp(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 10000)));
  const values = Array.from({ length: n }, () => Math.exp(-(2 + 2 * rng())) * 2);
  const estimate = mean(values);
  const exact = Math.exp(-2) - Math.exp(-4);
  return result(
    "Monte Carlo integral estimate",
    "The integral is estimated by averaging transformed uniform draws.",
    [
      { label: "estimate", value: formatNumber(estimate, 6), detail: "Monte Carlo" },
      { label: "exact value", value: formatNumber(exact, 6), detail: "exp(-2) - exp(-4)" },
      { label: "absolute error", value: formatNumber(Math.abs(estimate - exact), 6), detail: `${n} draws` }
    ],
    { type: "bars", title: "Contribution histogram", xLabel: "estimate contribution", yLabel: "count", bars: histogram(values) }
  );
}

function mcTransform(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const uniformValues = Array.from({ length: n }, () => {
    const u = Math.max(rng(), Number.EPSILON);
    return 5 * (1 / (u * u)) * Math.sqrt(1 / u - 1) * Math.exp(-(1 / u - 1));
  });
  const exponentialValues = Array.from({ length: n }, () => 5 * Math.sqrt(exponentialRandom(rng)));
  return result(
    "Estimator comparison",
    "Both estimators target the same quantity with different sampling distributions.",
    [
      { label: "uniform estimate", value: formatNumber(mean(uniformValues), 5), detail: `variance ${formatNumber(variance(uniformValues), 4)}` },
      { label: "exponential estimate", value: formatNumber(mean(exponentialValues), 5), detail: `variance ${formatNumber(variance(exponentialValues), 4)}` },
      { label: "variance ratio", value: formatNumber(variance(uniformValues) / variance(exponentialValues), 3), detail: "uniform / exponential" }
    ],
    { type: "bars", title: "Estimator variance", xLabel: "method", yLabel: "variance", bars: [{ label: "uniform", value: variance(uniformValues) }, { label: "exponential", value: variance(exponentialValues) }] }
  );
}

function normalCdfExample(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const low = num(controls, "low", 0.1);
  const high = num(controls, "high", 2.5);
  const xs = Array.from({ length: 10 }, (_, index) => low + (index * (high - low)) / 9);
  const z = Array.from({ length: n }, () => normalRandom(rng));
  const rows = xs.map((xValue) => {
    const indicator = mean(z.map((value) => (value <= xValue ? 1 : 0)));
    const exact = normalCdf(xValue);
    return [formatNumber(xValue, 3), formatNumber(indicator, 4), formatNumber(exact, 4), formatNumber(Math.abs(indicator - exact), 4)];
  });
  return result(
    "Normal CDF simulation grid",
    "Indicator simulation is compared with the analytic normal CDF.",
    [
      { label: "grid points", value: String(xs.length), detail: `from ${low} to ${high}` },
      { label: "draws", value: String(n), detail: "standard normal sample" },
      { label: "max error", value: formatNumber(Math.max(...rows.map((row) => Number(row[3]))), 4), detail: "indicator vs Phi" }
    ],
    { type: "line", title: "Phi(x) estimate", xLabel: "x", yLabel: "CDF", series: [{ label: "indicator", points: xs.map((xValue, index) => ({ x: xValue, y: Number(rows[index][1]) })), color: "#136f63" }, { label: "Phi", points: xs.map((xValue) => ({ x: xValue, y: normalCdf(xValue) })), color: "#d1495b" }] },
    { columns: ["x", "Indicator MC", "Phi(x)", "Abs. error"], rows }
  );
}

function antitheticExp(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const half = Math.floor(n / 2);
  const paired = Array.from({ length: half }, () => {
    const u = rng();
    return (Math.exp(u) + Math.exp(1 - u)) / 2;
  });
  const independent = Array.from({ length: n }, () => Math.exp(rng()));
  const exact = Math.E - 1;
  return result(
    "Antithetic estimator for exp(U)",
    "Paired uniforms U and 1-U reduce estimator variance for a monotone integrand.",
    [
      { label: "antithetic estimate", value: formatNumber(mean(paired), 5), detail: `exact ${formatNumber(exact, 5)}` },
      { label: "independent estimate", value: formatNumber(mean(independent), 5), detail: "simple MC" },
      { label: "variance reduction", value: `${formatNumber((1 - variance(paired) / variance(independent)) * 100, 2)}%`, detail: "sample variance basis" }
    ],
    { type: "bars", title: "Estimator variance", xLabel: "method", yLabel: "variance", bars: [{ label: "antithetic", value: variance(paired) }, { label: "independent", value: variance(independent) }] }
  );
}

function antitheticGamma(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const half = Math.floor(n / 2);
  const paired = Array.from({ length: half }, () => {
    const u = Math.max(rng(), Number.EPSILON);
    return (Math.pow(-Math.log(u), 0.9) + Math.pow(-Math.log(1 - u), 0.9)) / 2;
  });
  return result(
    "Antithetic gamma-like integral",
    "The paired estimator mirrors the WALS antithetic integral example.",
    [
      { label: "estimate", value: formatNumber(mean(paired), 5), detail: "antithetic method" },
      { label: "standard error", value: formatNumber(standardDeviation(paired) / Math.sqrt(half), 5), detail: `${half} pairs` },
      { label: "pair variance", value: formatNumber(variance(paired), 5), detail: "variance of pair means" }
    ],
    { type: "bars", title: "Pair-mean histogram", xLabel: "pair mean", yLabel: "count", bars: histogram(paired) }
  );
}

function controlExp(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const coefficient = num(controls, "coefficient", -1.6903);
  const simple = Array.from({ length: n }, () => {
    const u = rng();
    return { simple: Math.exp(u), control: Math.exp(u) + coefficient * (u - 0.5) };
  });
  const simpleValues = simple.map((item) => item.simple);
  const controlValues = simple.map((item) => item.control);
  return result(
    "Control variate estimator",
    "The adjustment uses U - 1/2, whose expectation is zero.",
    [
      { label: "simple estimate", value: formatNumber(mean(simpleValues), 5), detail: `variance ${formatNumber(variance(simpleValues), 5)}` },
      { label: "control estimate", value: formatNumber(mean(controlValues), 5), detail: `variance ${formatNumber(variance(controlValues), 5)}` },
      { label: "variance reduction", value: `${formatNumber((1 - variance(controlValues) / variance(simpleValues)) * 100, 2)}%`, detail: `c = ${formatNumber(coefficient, 3)}` }
    ],
    { type: "bars", title: "Simple vs control variate variance", xLabel: "method", yLabel: "variance", bars: [{ label: "simple", value: variance(simpleValues) }, { label: "control", value: variance(controlValues) }] }
  );
}

function controlRatio(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const pilot = Array.from({ length: 10000 }, () => rng());
  const f = (u: number) => Math.exp(-0.5) / (1 + u * u);
  const g = (u: number) => Math.exp(-u) / (1 + u * u);
  const pilotF = pilot.map(f);
  const pilotG = pilot.map(g);
  const fMean = mean(pilotF);
  const gMean = mean(pilotG);
  const covariance = mean(pilot.map((_, index) => (pilotF[index] - fMean) * (pilotG[index] - gMean)));
  const c = -covariance / variance(pilotF);
  const knownF = Math.exp(-0.5) * Math.PI / 4;
  const simple = Array.from({ length: n }, () => g(rng()));
  const controlled = Array.from({ length: n }, () => {
    const u = rng();
    return g(u) + c * (f(u) - knownF);
  });
  return result(
    "Estimated control-variate coefficient",
    "A pilot simulation estimates the coefficient used for the control-variate correction.",
    [
      { label: "simple estimate", value: formatNumber(mean(simple), 5), detail: `se ${formatNumber(standardDeviation(simple) / Math.sqrt(n), 5)}` },
      { label: "controlled estimate", value: formatNumber(mean(controlled), 5), detail: `se ${formatNumber(standardDeviation(controlled) / Math.sqrt(n), 5)}` },
      { label: "variance reduction", value: `${formatNumber((1 - variance(controlled) / variance(simple)) * 100, 2)}%`, detail: `c = ${formatNumber(c, 3)}` }
    ],
    { type: "bars", title: "Estimator variance", xLabel: "method", yLabel: "variance", bars: [{ label: "simple", value: variance(simple) }, { label: "controlled", value: variance(controlled) }] }
  );
}

function importancePower(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const importance = Array.from({ length: n }, () => {
    const x = Math.pow(rng(), 1 / 5);
    return Math.pow(x, 5.1) / (5 * Math.pow(x, 4));
  });
  const simple = Array.from({ length: n }, () => Math.pow(rng(), 5));
  return result(
    "Importance sampling comparison",
    "The proposal density concentrates samples near larger x values.",
    [
      { label: "importance estimate", value: formatNumber(mean(importance), 6), detail: `variance ${formatNumber(variance(importance), 6)}` },
      { label: "simple estimate", value: formatNumber(mean(simple), 6), detail: `variance ${formatNumber(variance(simple), 6)}` },
      { label: "variance ratio", value: formatNumber(variance(simple) / variance(importance), 2), detail: "simple / importance" }
    ],
    { type: "bars", title: "Estimator variance", xLabel: "method", yLabel: "variance", bars: [{ label: "importance", value: variance(importance) }, { label: "simple", value: variance(simple) }] }
  );
}

function conditionalCircle(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(100, Math.round(num(controls, "sampleSize", 1000)));
  const conditional = Array.from({ length: n }, () => {
    const u = rng();
    return Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2));
  });
  const simple = Array.from({ length: n }, () => {
    const u = rng();
    return u * u + (2 * u - 1) ** 2 < 1 ? 1 : 0;
  });
  return result(
    "Conditional Monte Carlo estimator",
    "Conditioning replaces a binary hit/miss draw with a smooth conditional expectation.",
    [
      { label: "conditional estimate", value: formatNumber(mean(conditional), 5), detail: `variance ${formatNumber(variance(conditional), 5)}` },
      { label: "simple estimate", value: formatNumber(mean(simple), 5), detail: `variance ${formatNumber(variance(simple), 5)}` },
      { label: "variance reduction", value: `${formatNumber((1 - variance(conditional) / variance(simple)) * 100, 2)}%`, detail: "conditional vs simple" }
    ],
    { type: "bars", title: "Estimator variance", xLabel: "method", yLabel: "variance", bars: [{ label: "conditional", value: variance(conditional) }, { label: "simple", value: variance(simple) }] }
  );
}

function bootstrapMax(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const values = parseNumberList(str(controls, "data", "0.5,0.6,0.7"));
  const replicates = Math.max(100, Math.round(num(controls, "replicates", 1000)));
  const maxima = Array.from({ length: replicates }, () => sampleWithReplacement(rng, values, values.length).reduce((a, b) => Math.max(a, b), -Infinity));
  return result(
    "Bootstrap distribution of the maximum",
    "Each bootstrap replicate samples observed values with replacement and records the maximum.",
    [
      { label: "bootstrap mean max", value: formatNumber(mean(maxima), 4), detail: "mean of maxima" },
      { label: "95% interval", value: `${formatNumber(quantile(maxima, 0.025), 3)} - ${formatNumber(quantile(maxima, 0.975), 3)}`, detail: "percentile interval" },
      { label: "replicates", value: String(replicates), detail: `${values.length} observed values` }
    ],
    { type: "bars", title: "Bootstrap maxima", xLabel: "max value bin", yLabel: "count", bars: histogram(maxima) }
  );
}

function meanBootstrap(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const n = Math.max(50, Math.round(num(controls, "sampleSize", 10000)));
  const replicates = Math.max(100, Math.round(num(controls, "replicates", 1000)));
  const sample = Array.from({ length: n }, () => normalRandom(rng, 5, 2));
  const bootMeans = Array.from({ length: replicates }, () => mean(sampleWithReplacement(rng, sample, Math.min(sample.length, 500))));
  return result(
    "Bootstrap mean summary",
    "The bootstrap reuses the generated sample to estimate the mean's sampling spread.",
    [
      { label: "sample mean", value: formatNumber(mean(sample), 4), detail: "generated sample" },
      { label: "bootstrap mean", value: formatNumber(mean(bootMeans), 4), detail: "mean of bootstrap means" },
      { label: "bootstrap sd", value: formatNumber(standardDeviation(bootMeans), 4), detail: "bootstrap standard error" }
    ],
    { type: "bars", title: "Bootstrap means", xLabel: "mean bin", yLabel: "count", bars: histogram(bootMeans) }
  );
}

function mcmcMixture(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const burnin = Math.max(0, Math.round(num(controls, "burnin", 200)));
  const sampleSize = Math.max(50, Math.round(num(controls, "sampleSize", 400)));
  const density = (x: number, y: number) => 0.5 * Math.exp(-((x - 6) ** 2 + (y - 6) ** 2) / 4) + 0.5 * Math.exp(-(x * x + y * y) / 2);
  let x = rng() * 10 - 2;
  let y = rng() * 10 - 2;
  let accepted = 0;
  const points: ChartPoint[] = [];
  for (let i = 0; i < burnin + sampleSize; i += 1) {
    const px = x + normalRandom(rng, 0, 1);
    const py = y + normalRandom(rng, 0, 1);
    const ratio = density(px, py) / Math.max(density(x, y), Number.EPSILON);
    if (rng() < Math.min(1, ratio)) {
      x = px;
      y = py;
      accepted += 1;
    }
    if (i >= burnin) {
      points.push({ x, y, color: i === burnin ? "#d1495b" : "#136f63" });
    }
  }
  return result(
    "Metropolis-Hastings sample path",
    "The chain moves through a two-mode target density after the selected burn-in.",
    [
      { label: "acceptance rate", value: formatNumber(accepted / (burnin + sampleSize), 4), detail: "accepted proposals" },
      { label: "sample size", value: String(sampleSize), detail: `${burnin} burn-in draws` },
      { label: "mean location", value: `(${formatNumber(mean(points.map((p) => p.x)), 2)}, ${formatNumber(mean(points.map((p) => p.y)), 2)})`, detail: "posterior sample mean" }
    ],
    { type: "scatter", title: "MCMC draws", xLabel: "x1", yLabel: "x2", points, xDomain: [-4, 10], yDomain: [-4, 10] }
  );
}

function politician(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const steps = Math.max(1000, Math.round(num(controls, "steps", 5000)));
  const islands = ["Is1", "Is2", "Is3", "Is4", "Is5", "Is6", "Is7", "Is8", "Is9"];
  const population = [100, 700, 400, 200, 350, 450, 800, 500, 200];
  let current = Math.floor(rng() * islands.length);
  const visits = Array.from({ length: islands.length }, () => 0);
  for (let i = 0; i < steps; i += 1) {
    visits[current] += 1;
    const direction = rng() < 0.5 ? -1 : 1;
    const proposal = (current + direction + islands.length) % islands.length;
    const accept = Math.min(1, population[proposal] / population[current]);
    if (rng() < accept) current = proposal;
  }
  const bars = islands.map((island, index) => ({ label: island, value: visits[index] / steps }));
  return result(
    "Metropolis walk over islands",
    "Visit frequencies approximate the target population proportions.",
    [
      { label: "steps", value: String(steps), detail: "single-chain simulation" },
      { label: "most visited", value: bars.reduce((best, item) => (item.value > best.value ? item : best)).label, detail: "highest empirical frequency" },
      { label: "target largest", value: "Is7", detail: "largest population" }
    ],
    { type: "bars", title: "Visit frequency by island", xLabel: "island", yLabel: "frequency", bars, yDomain: [0, Math.max(...bars.map((bar) => bar.value)) * 1.2] }
  );
}

function anova(controls: ControlMap, seed: number): SimulationResult {
  const rng = createRandom(seed);
  const dataset = str(controls, "dataset", "random");
  const groups: Array<{ label: string; values: number[] }> =
    dataset === "fuel"
      ? [
          { label: "Brand A", values: [7.8, 8.2, 8.65, 8.0, 8.36] },
          { label: "Brand B", values: [9.5, 10.21, 9.85, 10.02, 9.39] },
          { label: "Brand C", values: [8.2, 8.87, 8.35, 9.03, 8.68] }
        ]
      : dataset === "temperature"
        ? [
            { label: "80 C", values: [254, 263, 241, 237, 251] },
            { label: "85 C", values: [234, 218, 235, 227, 216] },
            { label: "90 C", values: [200, 222, 197, 206, 204] }
          ]
        : [
            { label: "Group 1", values: Array.from({ length: Math.round(num(controls, "n1", 5)) }, () => normalRandom(rng, num(controls, "mu1", 1), num(controls, "sigma", 1))) },
            { label: "Group 2", values: Array.from({ length: Math.round(num(controls, "n2", 5)) }, () => normalRandom(rng, num(controls, "mu2", 2), num(controls, "sigma", 1))) },
            { label: "Group 3", values: Array.from({ length: Math.round(num(controls, "n3", 5)) }, () => normalRandom(rng, num(controls, "mu3", 3), num(controls, "sigma", 1))) }
          ];
  const all = groups.flatMap((group) => group.values);
  const grandMean = mean(all);
  const ssBetween = groups.reduce((sum, group) => sum + group.values.length * (mean(group.values) - grandMean) ** 2, 0);
  const ssWithin = groups.reduce((sum, group) => sum + group.values.reduce((inner, value) => inner + (value - mean(group.values)) ** 2, 0), 0);
  const dfBetween = groups.length - 1;
  const dfWithin = all.length - groups.length;
  const msBetween = ssBetween / dfBetween;
  const msWithin = ssWithin / dfWithin;
  const f = msBetween / msWithin;
  return result(
    "ANOVA summary",
    "The table partitions variability into between-group and within-group components.",
    [
      { label: "F statistic", value: formatNumber(f, 4), detail: "MS between / MS within" },
      { label: "grand mean", value: formatNumber(grandMean, 4), detail: `${all.length} observations` },
      { label: "groups", value: String(groups.length), detail: dataset }
    ],
    { type: "bars", title: "Group means", xLabel: "group", yLabel: "mean", bars: groups.map((group) => ({ label: group.label, value: mean(group.values) })) },
    {
      columns: ["Source", "Df", "Sum Sq", "Mean Sq", "F"],
      rows: [
        ["Between groups", dfBetween, formatNumber(ssBetween, 4), formatNumber(msBetween, 4), formatNumber(f, 4)],
        ["Within groups", dfWithin, formatNumber(ssWithin, 4), formatNumber(msWithin, 4), ""]
      ]
    }
  );
}

function confidenceInterval(controls: ControlMap): SimulationResult {
  const mu = 31.5;
  const sigma = 0.3577;
  const sampleSize = Math.max(1, Math.round(num(controls, "sampleSize", 5)));
  const width = num(controls, "nSigma", 2) * Number(sigma.toFixed(2)) / Math.sqrt(sampleSize);
  const means = [num(controls, "mean1", 31.3), num(controls, "mean2", 31.7), num(controls, "mean3", 32.5)];
  const intervals = [
    { label: "Population", center: mu, lower: mu - width, upper: mu + width, color: "#136f63" },
    ...means.map((center, index) => ({ label: `Sample ${index + 1}`, center, lower: center - width, upper: center + width, color: ["#d1495b", "#f28e2b", "#4e79a7"][index] }))
  ];
  const covering = intervals.slice(1).filter((interval) => interval.lower <= mu && interval.upper >= mu).length;
  return result(
    "Sample-centered confidence intervals",
    "Intervals are drawn at equal width around the population mean and three sample means.",
    [
      { label: "interval half-width", value: formatNumber(width, 3), detail: `${num(controls, "nSigma", 2)} sigma / sqrt(${sampleSize})` },
      { label: "covering samples", value: `${covering} / 3`, detail: "sample intervals covering mu" },
      { label: "sample size", value: String(num(controls, "sampleSize", 5)), detail: "kept from WALS control" }
    ],
    { type: "intervals", title: "Intervals around means", xLabel: "value", yLabel: "interval", intervals, reference: mu, xDomain: [29, 34] }
  );
}

function distribution(controls: ControlMap): SimulationResult {
  const dist = str(controls, "dist", "norm");
  const mode = str(controls, "mode", "PDF");
  const a = num(controls, "a", 0);
  const b = Math.max(0.1, num(controls, "b", 1));
  const lower = num(controls, "lower", -2);
  const upper = num(controls, "upper", 2);
  const isDiscrete = ["binom", "geom", "pois"].includes(dist);
  const xs = isDiscrete
    ? Array.from({ length: Math.max(8, Math.round(b) + 1) }, (_, index) => index)
    : Array.from({ length: 160 }, (_, index) => lower - 2 + (index * (upper - lower + 4)) / 159);
  const pdf = (x: number) => {
    if (dist === "exp") return x < 0 ? 0 : b * Math.exp(-b * x);
    if (dist === "unif") return x >= a && x <= b ? 1 / Math.max(b - a, Number.EPSILON) : 0;
    if (dist === "pois") return Math.exp(-b) * Math.pow(b, x) / Math.max(1, Array.from({ length: x }, (_, index) => index + 1).reduce((product, value) => product * value, 1));
    if (dist === "binom") {
      const size = Math.max(1, Math.round(b));
      const p = Math.min(0.95, Math.max(0.05, a || 0.5));
      if (x < 0 || x > size || !Number.isInteger(x)) return 0;
      const choose = Array.from({ length: x }, (_, index) => (size - index) / (index + 1)).reduce((product, value) => product * value, 1);
      return choose * p ** x * (1 - p) ** (size - x);
    }
    return normalPdf(x, a, b);
  };
  const points = xs.map((x) => ({ x, y: mode === "CDF" ? xs.filter((v) => v <= x).reduce((sum, v) => sum + pdf(v), 0) / xs.reduce((sum, v) => sum + pdf(v), 0) : pdf(x) }));
  const probability = dist === "norm" ? normalCdf(upper, a, b) - normalCdf(lower, a, b) : points.filter((point) => point.x >= lower && point.x <= upper).reduce((sum, point) => sum + point.y, 0) / Math.max(points.reduce((sum, point) => sum + point.y, 0), Number.EPSILON);
  return result(
    "Distribution explorer",
    `${mode} view for ${dist}; parameter a and b map to the selected distribution's primary controls.`,
    [
      { label: "distribution", value: dist, detail: mode },
      { label: "interval probability", value: formatNumber(probability, 4), detail: `P(${lower} <= X <= ${upper})` },
      { label: "points rendered", value: String(points.length), detail: isDiscrete ? "discrete support" : "continuous grid" }
    ],
    isDiscrete
      ? { type: "bars", title: `${dist} ${mode}`, xLabel: "x", yLabel: mode, bars: points.map((point) => ({ label: String(point.x), value: point.y })) }
      : { type: "line", title: `${dist} ${mode}`, xLabel: "x", yLabel: mode, series: [{ label: dist, points, color: "#136f63" }] }
  );
}

function linearRegressionExample(controls: ControlMap, _seed: number, data?: { cities?: CityRecord[] }): SimulationResult {
  const feature = str(controls, "feature", "completed") as "completed" | "GDP";
  const exclude = str(controls, "excludeHighLeverage", "no") === "yes";
  const source = data?.cities ?? [];
  const kept = exclude ? source.filter((city) => !["上海", "香港"].includes(city.city)) : source;
  const points = kept.map((city) => ({ x: city[feature], y: city.planning, label: city.city }));
  const fit = linearRegression(points);
  const xMin = points.map((point) => point.x).reduce((a, b) => Math.min(a, b), Infinity);
  const xMax = points.map((point) => point.x).reduce((a, b) => Math.max(a, b), -Infinity);
  const line: ChartSeries = { label: "least squares fit", color: "#d1495b", points: [{ x: xMin, y: fit.intercept + fit.slope * xMin }, { x: xMax, y: fit.intercept + fit.slope * xMax }] };
  return result(
    "City regression model",
    "The WALS city dataset links planned skyscrapers with either completed buildings or GDP.",
    [
      { label: "slope", value: formatNumber(fit.slope, 5), detail: `predictor: ${feature}` },
      { label: "intercept", value: formatNumber(fit.intercept, 4), detail: "least-squares fit" },
      { label: "R-squared", value: formatNumber(fit.rSquared, 4), detail: `${kept.length} cities` }
    ],
    { type: "scatter", title: "Planned skyscrapers regression", xLabel: feature, yLabel: "planned", points, line },
    { columns: ["City", feature, "planned"], rows: kept.map((city) => [city.city, city[feature], city.planning]) }
  );
}

export function runExample(
  example: ExampleConfig,
  controls: ControlMap,
  seed: number,
  data?: { cities?: CityRecord[] }
): SimulationResult {
  switch (example.kind) {
    case "pi-circle":
      return piCircle(controls, seed);
    case "buffon":
      return buffon(controls, seed);
    case "random-normal":
      return randomNormal(controls, seed);
    case "random-exponential":
      return randomExponential(controls, seed);
    case "gamma-rejection":
      return gammaRejection(controls, seed);
    case "mc-integral-exp":
      return mcIntegralExp(controls, seed);
    case "mc-transform":
      return mcTransform(controls, seed);
    case "normal-cdf":
      return normalCdfExample(controls, seed);
    case "antithetic-exp":
      return antitheticExp(controls, seed);
    case "antithetic-gamma":
      return antitheticGamma(controls, seed);
    case "control-exp":
      return controlExp(controls, seed);
    case "control-ratio":
      return controlRatio(controls, seed);
    case "importance-power":
      return importancePower(controls, seed);
    case "conditional-circle":
      return conditionalCircle(controls, seed);
    case "bootstrap-max":
      return bootstrapMax(controls, seed);
    case "mean-bootstrap":
      return meanBootstrap(controls, seed);
    case "mcmc-mixture":
      return mcmcMixture(controls, seed);
    case "politician":
      return politician(controls, seed);
    case "anova":
      return anova(controls, seed);
    case "confidence-interval":
      return confidenceInterval(controls);
    case "distribution":
      return distribution(controls);
    case "linear-regression":
      return linearRegressionExample(controls, seed, data);
    default:
      return result(
        "Template pending",
        `No calculation engine has been mapped for ${example.kind}.`,
        [{ label: "source", value: example.sourcePath }],
        { type: "bars", title: "No data", xLabel: "template", yLabel: "value", bars: [{ label: example.id, value: 1 }] }
      );
  }
}
