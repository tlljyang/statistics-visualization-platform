import type { Sources, Sinks } from './types';
import { view } from './view';

export default function Chart(sources: Sources): Sinks {
  const vdom$ = view(sources.props);

  return {
    DOM: vdom$
  };
}

export { view };
export type { ChartProps, Sources, Sinks } from './types';

// Re-export graph and axes functions for backward compatibility
export { XAxis, YAxis } from './axes';
export {
  NullDistribution,
  TrueDistribution,
  CriticalLine,
  Type1ErrorArea,
  Type2ErrorArea,
  HypothesisText
} from './graph';
