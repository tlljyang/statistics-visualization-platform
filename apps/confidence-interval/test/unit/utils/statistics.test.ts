import { expect } from 'chai';
import { generateSample, ci, calculateCoverage } from '../../../src/components/confidence-interval/model';
import type { Sample } from '../../../src/components/confidence-interval/types';

describe('Statistics Utilities - generateSample', () => {
  it('should generate sample of correct size', () => {
    const sample = generateSample(10, 2, 50);
    expect(sample).to.have.lengthOf(50);
  });

  it('should generate values within expected range (3-4 standard deviations)', () => {
    const mean = 10;
    const stddev = 2;
    const n = 1000;
    const sample = generateSample(mean, stddev, n);

    // Check that most values are within 4 standard deviations
    const max = Math.max(...sample);
    const min = Math.min(...sample);
    expect(max).to.be.lessThan(mean + 4 * stddev);
    expect(min).to.be.greaterThan(mean - 4 * stddev);
  });

  it('should handle small sample sizes', () => {
    const sample = generateSample(10, 2, 1);
    expect(sample).to.have.lengthOf(1);
  });

  it('should handle zero sample size', () => {
    const sample = generateSample(10, 2, 0);
    expect(sample).to.have.lengthOf(0);
  });
});

describe('Statistics Utilities - ci', () => {
  it('should calculate correct confidence interval', () => {
    const sample = [9.5, 10.2, 9.8, 10.1, 9.9];
    const result: Sample = ci(sample, 0.95, 10, 2);

    expect(result.lower).to.be.lessThan(result.mean);
    expect(result.upper).to.be.greaterThan(result.mean);
    expect(result.mean).to.be.approximately(9.9, 0.1);
  });

  it('should correctly identify if interval contains population mean', () => {
    const sample = [9.5, 10.2, 9.8, 10.1, 9.9];
    const result: Sample = ci(sample, 0.95, 10, 2);

    // This sample should contain the population mean of 10
    expect(result.contains).to.be.true;
  });

  it('should handle empty sample', () => {
    const result: Sample = ci([], 0.95, 10, 2);

    expect(result.lower).to.be.NaN;
    expect(result.upper).to.be.NaN;
    expect(result.mean).to.be.NaN;
    expect(result.contains).to.be.false;
  });

  it('should calculate wider intervals for higher confidence levels', () => {
    const sample = [9.5, 10.2, 9.8, 10.1, 9.9];
    const ci90: Sample = ci(sample, 0.90, 10, 2);
    const ci99: Sample = ci(sample, 0.99, 10, 2);

    const width90 = ci90.upper - ci90.lower;
    const width99 = ci99.upper - ci99.lower;

    expect(width99).to.be.greaterThan(width90);
  });
});

describe('Statistics Utilities - calculateCoverage', () => {
  it('should return 0 for empty array', () => {
    const coverage = calculateCoverage([]);
    expect(coverage).to.equal(0);
  });

  it('should return 1 when all samples contain mean', () => {
    const samples: Sample[] = [
      { lower: 9, upper: 11, mean: 10, contains: true },
      { lower: 9.5, upper: 10.5, mean: 10, contains: true },
      { lower: 8, upper: 12, mean: 10, contains: true },
    ];
    const coverage = calculateCoverage(samples);
    expect(coverage).to.equal(1);
  });

  it('should return 0 when no samples contain mean', () => {
    const samples: Sample[] = [
      { lower: 11, upper: 12, mean: 11.5, contains: false },
      { lower: 8, upper: 9, mean: 8.5, contains: false },
    ];
    const coverage = calculateCoverage(samples);
    expect(coverage).to.equal(0);
  });

  it('should calculate correct percentage', () => {
    const samples: Sample[] = [
      { lower: 9, upper: 11, mean: 10, contains: true },
      { lower: 9.5, upper: 10.5, mean: 10, contains: true },
      { lower: 11, upper: 12, mean: 11.5, contains: false },
      { lower: 8, upper: 9, mean: 8.5, contains: false },
      { lower: 8, upper: 12, mean: 10, contains: true },
    ];
    const coverage = calculateCoverage(samples);
    expect(coverage).to.equal(0.6); // 3 out of 5
  });
});
