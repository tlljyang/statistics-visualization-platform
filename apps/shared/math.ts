// Special-function + chart helpers consolidated from the per-app engine.ts copies.
// Behavior-preserving: the `histogram` unification keys off `domain` (see comment).

import { formatNumber, mean } from "./format";

export interface ChartBar {
  label: string;
  value: number;
}

export function erf(x: number): number {
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

export function normalPdf(x: number, mu = 0, sd = 1): number {
  return Math.exp(-0.5 * ((x - mu) / sd) ** 2) / (sd * Math.sqrt(2 * Math.PI));
}

export function normalCdf(x: number, mu = 0, sd = 1): number {
  return 0.5 * (1 + erf((x - mu) / (sd * Math.sqrt(2))));
}

export function linearRegression(points: Array<{ x: number; y: number }>) {
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

/**
 * Bin `values` into `count` equal-width histogram bars.
 *
 * Behavior preservation across the two historical call shapes:
 * - `domain` provided (CLT app): min/max come from `domain`, so out-of-range
 *   values exist and are SKIPPED (`continue`) — matches the old CLT engine.
 * - `domain` absent (other 9 apps): min/max are derived from `values` itself,
 *   so no value can ever be out of range and the `continue` is dead code; only
 *   the clamp into the edge bin applies — matches the old standard engine.
 * The two guards key off mutually-exclusive runtime conditions, so they coexist.
 */
export function histogram(values: number[], count = 18, domain?: [number, number]): ChartBar[] {
  const min = domain?.[0] ?? values.reduce((a, b) => Math.min(a, b), Infinity);
  const max = domain?.[1] ?? values.reduce((a, b) => Math.max(a, b), -Infinity);
  const width = (max - min || 1) / count;
  const bins = Array.from({ length: count }, (_, index) => ({
    label: formatNumber(min + width * (index + 0.5), 2),
    value: 0
  }));

  for (const value of values) {
    if (value < min || value > max) continue;
    const index = Math.min(count - 1, Math.max(0, Math.floor((value - min) / width)));
    bins[index].value += 1;
  }

  return bins;
}
