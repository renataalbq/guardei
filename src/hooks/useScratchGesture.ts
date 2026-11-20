import { useCallback, useRef, type PointerEvent as ReactPointerEvent, type MouseEvent as ReactMouseEvent, type RefObject } from 'react';
import { classifyGesture, type GestureKind } from '../domain/classifyGesture';
import type { Point } from '../domain/strokeCoverage';

/** Depois de um risco, o navegador ainda pode disparar um "click" no botão onde o dedo saiu. */
const SUPPRESS_CLICK_AFTER_SCRATCH_MS = 450;

interface ScratchGestureOptions {
  /** Elemento com `touch-action: pan-y` que recebe os pointer events. */
  containerRef: RefObject<HTMLElement | null>;
  /** Path do SVG sobreposto onde o traço é desenhado em tempo real. */
  liveStrokeRef: RefObject<SVGPathElement | null>;
  /** Chamado ao soltar o dedo, com o traço em coordenadas do container (px). */
  onScratch: (points: Point[]) => void;
}

interface ActiveGesture {
  pointerId: number;
  kind: GestureKind;
  points: Point[];
}

function toPath(points: readonly Point[]): string {
  return points.map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(' ');
}

/**
 * Riscar com o dedo: decide nos primeiros ~10px se o gesto é risco (horizontal) ou rolagem (vertical).
 * Durante o risco o traço segue o dedo sem re-render do React; ao soltar, entrega o traço completo.
 * Toques simples não são tratados aqui: continuam chegando como "click" nas células.
 */
export function useScratchGesture({ containerRef, liveStrokeRef, onScratch }: ScratchGestureOptions) {
  const gesture = useRef<ActiveGesture | null>(null);
  const frame = useRef<number | undefined>(undefined);
  const suppressClicksUntil = useRef(0);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const pointFrom = useCallback(
    (event: { clientX: number; clientY: number }): Point => {
      const rect = containerRef.current!.getBoundingClientRect();
      return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    },
    [containerRef],
  );

  const drawLiveStroke = useCallback(() => {
    frame.current = undefined;
    const path = liveStrokeRef.current;
    if (path && gesture.current) path.setAttribute('d', toPath(gesture.current.points));
  }, [liveStrokeRef]);

  const clearLiveStroke = useCallback(
    (withFade: boolean) => {
      const path = liveStrokeRef.current;
      if (!path) return;
      clearTimeout(fadeTimer.current);
      if (!withFade) {
        path.setAttribute('d', '');
        return;
      }
      path.classList.add('live-stroke-fade');
      fadeTimer.current = setTimeout(() => {
        path.setAttribute('d', '');
        path.classList.remove('live-stroke-fade');
      }, 280);
    },
    [liveStrokeRef],
  );

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0) || !containerRef.current) return;
      clearLiveStroke(false);
      gesture.current = { pointerId: event.pointerId, kind: 'undecided', points: [pointFrom(event)] };
    },
    [clearLiveStroke, containerRef, pointFrom],
  );

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      const current = gesture.current;
      if (!current || current.pointerId !== event.pointerId) return;

      if (current.kind === 'undecided') {
        const start = current.points[0]!;
        const point = pointFrom(event);
        const kind = classifyGesture(point.x - start.x, point.y - start.y);
        if (kind === 'undecided') return;
        if (kind === 'scroll') {
          gesture.current = null; // o navegador cuida da rolagem
          return;
        }
        current.kind = 'scratch';
        event.currentTarget.setPointerCapture(event.pointerId);
      }

      const coalesced = event.nativeEvent.getCoalescedEvents?.() ?? [];
      for (const sample of coalesced.length > 0 ? coalesced : [event]) current.points.push(pointFrom(sample));
      if (frame.current === undefined) frame.current = requestAnimationFrame(drawLiveStroke);
    },
    [drawLiveStroke, pointFrom],
  );

  const finish = useCallback(
    (event: ReactPointerEvent<HTMLElement>, cancelled: boolean) => {
      const current = gesture.current;
      if (!current || current.pointerId !== event.pointerId) return;
      gesture.current = null;
      if (frame.current !== undefined) cancelAnimationFrame(frame.current);
      frame.current = undefined;
      if (current.kind !== 'scratch') return;

      suppressClicksUntil.current = performance.now() + SUPPRESS_CLICK_AFTER_SCRATCH_MS;
      if (cancelled) {
        clearLiveStroke(false);
        return;
      }
      current.points.push(pointFrom(event));
      onScratch(current.points);
      clearLiveStroke(true);
    },
    [clearLiveStroke, onScratch, pointFrom],
  );

  const onPointerUp = useCallback((event: ReactPointerEvent<HTMLElement>) => finish(event, false), [finish]);
  const onPointerCancel = useCallback((event: ReactPointerEvent<HTMLElement>) => finish(event, true), [finish]);

  const onClickCapture = useCallback((event: ReactMouseEvent<HTMLElement>) => {
    if (performance.now() < suppressClicksUntil.current) {
      event.preventDefault();
      event.stopPropagation();
    }
  }, []);

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, onClickCapture };
}
