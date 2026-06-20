// Number formatting + descriptive statistics shared across the WALS simulation apps.
// Source: consolidated from the byte-identical apps/*/src/utils/format.ts copies.

export function formatNumber(value: number, digits = 4): string {
  if (!Number.isFinite(value)) {
    return "n/a";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: digits,
    minimumFractionDigits: Math.min(2, digits)
  }).format(value);
}

export function mean(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function variance(values: number[]): number {
  const center = mean(values);
  return values.reduce((sum, value) => sum + (value - center) ** 2, 0) / Math.max(values.length - 1, 1);
}

export function standardDeviation(values: number[]): number {
  return Math.sqrt(variance(values));
}

export function quantile(values: number[], p: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export function parseNumberList(value: string): number[] {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}
