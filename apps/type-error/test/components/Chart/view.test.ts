import { describe, it, expect } from 'vitest';
import xs from 'xstream';
import { view } from '../../../src/components/Chart/view';
import type { ChartProps } from '../../../src/components/Chart/types';

describe('Chart view', () => {
  it('should render SVG container', () => {
    const mockScales = {
      xScale: (val: number) => val,
      yScale: (val: number) => val
    } as any;

    const props: ChartProps = {
      scales: mockScales,
      nullDistribution: [],
      trueDistribution: [],
      criticalValue: [],
      criticalAreaFn: () => false,
      hypothesisText: { H0Text: 'H0', H1Text: 'H1' },
      width: 600,
      height: 400
    };

    const props$ = xs.of(props);
    const vdom$ = view(props$);

    return new Promise<void>((resolve, reject) => {
      vdom$.addListener({
        next: (vnode) => {
          expect(vnode).toBeDefined();
          expect(vnode.sel).toContain('div');
          expect(vnode.sel).toContain('.chart');
          resolve();
        },
        error: reject,
        complete: () => {}
      });
    });
  });

  it('should render with correct props data', () => {
    const mockScales = {
      xScale: (val: number) => val * 10,
      yScale: (val: number) => val * 5
    } as any;

    const mockDistribution = [
      { x: 0, y: 0.5 },
      { x: 1, y: 0.4 }
    ];

    const props: ChartProps = {
      scales: mockScales,
      nullDistribution: mockDistribution,
      trueDistribution: mockDistribution,
      criticalValue: [1.96, -1.96],
      criticalAreaFn: (d: any, c: any) => d.x > c[0],
      hypothesisText: { H0Text: 'H₀: μ = 0', H1Text: 'Hₐ: μ ≠ 0' },
      width: 600,
      height: 400
    };

    const props$ = xs.of(props);
    const vdom$ = view(props$);

    return new Promise<void>((resolve, reject) => {
      let called = false;
      vdom$.addListener({
        next: (vnode) => {
          if (called) return;
          called = true;
          expect(vnode).toBeDefined();
          resolve();
        },
        error: reject,
        complete: () => {}
      });
    });
  });
});
