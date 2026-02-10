import { useRef, useLayoutEffect, useMemo } from 'react';
import type { ReactElement } from 'react';
import type { DependencyGraphTypes } from '@backstage/core-components';
import { useTheme } from '@material-ui/core/styles';
import * as d3Shape from 'd3-shape';
import rough from 'roughjs';
import { getExcalidrawPalette } from '../theme/excalidrawPalette';

const STROKE_WIDTH = 0.75;
/** Extend path endpoints into the node so the rough stroke visibly meets the node (fixes gap at bottom/sides). */
const EDGE_ENDPOINT_OVERLAP = 15;

function isFinitePoint(
  p: { x: number; y: number },
): p is { x: number; y: number } {
  return Number.isFinite(p.x) && Number.isFinite(p.y);
}

function extendEndpoint(
  from: { x: number; y: number },
  toward: { x: number; y: number },
  distance: number,
): { x: number; y: number } {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const len = Math.hypot(dx, dy);
  if (len === 0) return toward;
  return {
    x: toward.x + (dx / len) * distance,
    y: toward.y + (dy / len) * distance,
  };
}

/**
 * Extend first and last points outward so the drawn path overlaps the node and the rough stroke meets the border.
 */
function extendEdgeEndpoints(points: { x: number; y: number }[]): { x: number; y: number }[] {
  const finite = points.filter(isFinitePoint);
  if (finite.length < 2) return finite;
  const first = extendEndpoint(finite[1], finite[0], EDGE_ENDPOINT_OVERLAP);
  const last = extendEndpoint(
    finite[finite.length - 2],
    finite[finite.length - 1],
    EDGE_ENDPOINT_OVERLAP,
  );
  return [first, ...finite.slice(1, -1), last];
}

function buildPathD(points: { x: number; y: number }[]): string {
  const extended = extendEdgeEndpoints(points);
  if (extended.length === 0) return '';
  const line = d3Shape
    .line<{ x: number; y: number }>()
    .x((d: { x: number; y: number }) => d.x)
    .y((d: { x: number; y: number }) => d.y)
    .curve(d3Shape.curveCatmullRom.alpha(0.5));
  return line(extended) ?? '';
}

/**
 * Inner component that holds all hooks. The graph calls renderEdge(props) directly
 * (it does not mount a component), so hooks must run in a real component we return.
 */
function ExcalidrawEdgeInner(
  props: DependencyGraphTypes.RenderEdgeProps<unknown>,
): ReactElement {
  const { edge } = props;
  const theme = useTheme();
  const paletteType = theme.palette as {
    type?: 'light' | 'dark';
    mode?: 'light' | 'dark';
  };
  const isDark =
    paletteType.type === 'dark' || paletteType.mode === 'dark';
  const palette = getExcalidrawPalette(isDark);
  const edgeStroke = isDark ? palette.edgeStroke : '#616161';
  const containerRef = useRef<SVGGElement>(null);
  const roughPathRef = useRef<SVGGElement | null>(null);

  const pathD = useMemo(
    () => buildPathD(edge.points ?? []),
    [edge.points],
  );

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container || !pathD) {
      if (container && roughPathRef.current?.parentNode === container) {
        container.removeChild(roughPathRef.current);
        roughPathRef.current = null;
      }
      return () => {};
    }

    const svg = container.ownerSVGElement;
    if (!svg) return () => {};

    if (
      roughPathRef.current &&
      roughPathRef.current.parentNode === container
    ) {
      container.removeChild(roughPathRef.current);
      roughPathRef.current = null;
    }

    const rc = rough.svg(svg);
    const roughPath = rc.path(pathD, {
      stroke: edgeStroke,
      strokeWidth: STROKE_WIDTH,
      fill: 'none',
      roughness: 0.3,
    });
    container.appendChild(roughPath);
    roughPathRef.current = roughPath;

    return () => {
      if (
        roughPathRef.current &&
        roughPathRef.current.parentNode === container
      ) {
        container.removeChild(roughPathRef.current);
        roughPathRef.current = null;
      }
    };
  }, [pathD, edgeStroke]);

  return <g ref={containerRef} pointerEvents="none" />;
}

/**
 * Wrapper with no hooks. DependencyGraph calls renderEdge(props) during its render,
 * so this function must not use hooks or the graph's hook count would change with edge count.
 */
export function ExcalidrawEdge(
  props: DependencyGraphTypes.RenderEdgeProps<unknown>,
): ReactElement {
  return <ExcalidrawEdgeInner {...props} />;
}
