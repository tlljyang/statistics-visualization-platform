import type { DOMSource } from '@cycle/dom';
import xs, { Stream } from 'xstream';
import throttle from 'xstream/extra/throttle';
import { $el } from '../../_utils/dom';
import type {
  RegressionChartProps,
  Actions,
  Point,
  PointerCoordinates,
  PointHoverAction,
} from './types';
function getChartCoordinates(pointerEvent: PointerEvent): PointerCoordinates {
  const svgElement = pointerEvent.currentTarget as SVGSVGElement;
  const rect = svgElement.getBoundingClientRect();
  const viewBox = svgElement.viewBox.baseVal;
  const scaleX = viewBox.width / rect.width;
  const scaleY = viewBox.height / rect.height;
  const marginLeft = Number(svgElement.dataset.marginLeft ?? 0);
  const marginTop = Number(svgElement.dataset.marginTop ?? 0);

  return {
    x: (pointerEvent.clientX - rect.left) * scaleX - marginLeft,
    y: (pointerEvent.clientY - rect.top) * scaleY - marginTop,
  };
}

export function intent(sources: {
  DOM: DOMSource;
  props: Stream<RegressionChartProps>;
}): Actions {
  // (margins are available via props; no local snapshot required)

  // ==================== SVG pointer events (for line drawing) ====================
  const pointerDown$: Stream<PointerCoordinates> = $el(sources.DOM, 'svg')
    .events('pointerdown')
    .map((ev: Event) => {
      const pointerEvent = ev as PointerEvent;
      return getChartCoordinates(pointerEvent);
    });

  const pointerMove$: Stream<PointerCoordinates> = $el(sources.DOM, 'svg')
    .events('pointermove')
    .map((ev: Event) => {
      const pointerEvent = ev as PointerEvent;
      return getChartCoordinates(pointerEvent);
    })
    .compose(throttle(16)); // ~60fps

  const pointerUp$: Stream<PointerCoordinates> = $el(sources.DOM, 'svg')
    .events('pointerup')
    .map((ev: Event) => {
      const pointerEvent = ev as PointerEvent;
      return getChartCoordinates(pointerEvent);
    });

  // ==================== Point hover events (NEW) ====================
  // Hover enter on data points
  const pointHoverEnter$: Stream<PointHoverAction> = $el(
    sources.DOM,
    '.data-point'
  )
    .events('mouseenter')
    .map((ev: Event) => {
      const mouseEvent = ev as MouseEvent;
      // Extract point data from the element's data attributes
      const pointData = (mouseEvent.target as HTMLElement).dataset;
      const point: Point = {
        x: parseFloat(pointData.x || '0'),
        y: parseFloat(pointData.y || '0'),
      };
      return {
        point,
        event: {
          offsetX: mouseEvent.offsetX,
          offsetY: mouseEvent.offsetY,
          target: mouseEvent.target,
        },
      };
    });

  // Hover leave on data points
  const pointHoverLeave$: Stream<PointHoverAction> = $el(
    sources.DOM,
    '.data-point'
  )
    .events('mouseleave')
    .map((ev: Event) => {
      const mouseEvent = ev as MouseEvent;
      return {
        point: null,
        event: {
          offsetX: mouseEvent.offsetX,
          offsetY: mouseEvent.offsetY,
          target: mouseEvent.target,
        },
      };
    });

  // Combine hover enter/leave into single stream
  // Provide a precise type for the merged hover stream so downstream code has a
  // Stream<PointHoverAction>-compatible type. We use a type assertion here to
  // keep the runtime behavior unchanged while satisfying the compiler.
  const pointHover$: Stream<PointHoverAction> = xs.merge(
    pointHoverEnter$,
    pointHoverLeave$
  );

  // ==================== Config ====================
  const config$ = sources.props;

  // ==================== Clear signal ====================
  const clearSignal$ = sources.props
    .map((props) => props.clearLineSignal)
    .filter((signal) => signal !== undefined)
    .map((signal) => signal!)
    .flatten()
    .startWith(null);

  return {
    pointerDown$,
    pointerMove$,
    pointerUp$,
    pointHover$,
    config$,
    clearSignal$,
  };
}
