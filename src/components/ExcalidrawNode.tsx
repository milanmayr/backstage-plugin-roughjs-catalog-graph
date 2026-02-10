import type { MouseEvent } from 'react';
import { useRef, useLayoutEffect, useState } from 'react';
import type { DependencyGraphTypes } from '@backstage/core-components';
import type { Entity } from '@backstage/catalog-model';
import { DEFAULT_NAMESPACE } from '@backstage/catalog-model';
import { useTheme } from '@material-ui/core/styles';
import rough from 'roughjs';
import { useEntityPresentation } from '@backstage/plugin-catalog-react';
import type { ExcalidrawPalette } from '../theme/excalidrawPalette';
import { getExcalidrawPalette } from '../theme/excalidrawPalette';

const PADDING = 10;
const HAND_DRAWN_FONT =
  '"Virgil", "Comic Sans MS", "Chalkboard SE", cursive';
const KIND_LABEL_GAP = 9;
const KIND_FONT_SIZE = 9;
const ICON_SIZE_SCALE = 0.75;

/**
 * Display label for a node. Prefers title/name from catalog; otherwise strips
 * the "default" namespace from the entity ref so "component:default/foo" → "component:foo".
 */
function getNodeLabel(node: { id: string; title?: string; name?: string }): string {
  const withTitle = node as { title?: string; name?: string };
  if (withTitle.title) return withTitle.title;
  if (withTitle.name) return withTitle.name;
  return node.id.replace(/:default\//, ':').replace(/\/default\//, '/');
}

/**
 * Display kind for a node (API, Component, Resource, Group, etc.).
 * Uses node.kind if present; otherwise parses from node.id (e.g. "component:default/foo" → "Component").
 */
function getNodeKind(node: { id: string; kind?: string }): string {
  const withKind = node as { kind?: string };
  if (withKind.kind) {
    const k = withKind.kind;
    return k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
  }
  const match = node.id.match(/^([^:]+):/);
  if (match) {
    const k = match[1];
    return k.charAt(0).toUpperCase() + k.slice(1).toLowerCase();
  }
  return '';
}

/**
 * Inner component that holds all hooks. The graph calls render({ node }) during
 * Node's render, so hooks must run in a real component we return.
 */
type NodeColor = 'default' | 'primary' | 'secondary';

/** Light theme: Backstage/MUI palette (blue). Dark: Excalidraw palette. */
function getNodeColors(
  isDark: boolean,
  muiPalette: {
    primary: { light: string; main: string };
    secondary: { light: string; main: string };
    grey: { 300: string; 600: string };
  },
  excalidrawPalette: ExcalidrawPalette,
  color: NodeColor,
): { fill: string; stroke: string } {
  if (isDark) {
    switch (color) {
      case 'primary':
        return excalidrawPalette.nodePrimary;
      case 'secondary':
        return excalidrawPalette.nodeSecondary;
      default:
        return excalidrawPalette.nodeDefault;
    }
  }
  switch (color) {
    case 'primary':
      return { fill: muiPalette.primary.light, stroke: muiPalette.primary.main };
    case 'secondary':
      return {
        fill: muiPalette.secondary.light,
        stroke: muiPalette.secondary.main,
      };
    default:
      return {
        fill: muiPalette.grey[300],
        stroke: muiPalette.grey[600],
      };
  }
}

function ExcalidrawNodeInner(
  props: DependencyGraphTypes.RenderNodeProps<unknown>,
): JSX.Element {
  const { node } = props;
  const theme = useTheme();
  const paletteType = theme.palette as {
    type?: 'light' | 'dark';
    mode?: 'light' | 'dark';
  };
  const isDark =
    paletteType.type === 'dark' || paletteType.mode === 'dark';
  const excalidrawPalette = getExcalidrawPalette(isDark);
  const muiPalette = theme.palette as Parameters<
    typeof getNodeColors
  >[1];
  const containerRef = useRef<SVGGElement>(null);
  const textRef = useRef<SVGTextElement>(null);
  const roughNodeRef = useRef<SVGGElement | null>(null);
  const [size, setSize] = useState({ width: 80, height: 32, iconSize: 0 });

  const nodeWithEntity = node as { entity?: Entity };
  const entityOrRef = (nodeWithEntity.entity ?? node.id) as Entity | string;
  const entityPresentation = useEntityPresentation(entityOrRef, {
    defaultNamespace: DEFAULT_NAMESPACE,
  });
  const hasKindIcon = Boolean(entityPresentation.Icon);
  const KindIcon = hasKindIcon ? entityPresentation.Icon : null;

  const nodeWithColor = node as { color?: NodeColor };
  const color = nodeWithColor.color ?? 'primary';
  const colors = getNodeColors(
    isDark,
    muiPalette,
    excalidrawPalette,
    color,
  );
  const textFill = isDark
    ? excalidrawPalette.colorOnSurface
    : '#ffffff';
  const nodeLabel = getNodeLabel(node as { id: string; title?: string; name?: string });
  const kindLabel = getNodeKind(node as { id: string; kind?: string });
  const kindTextY = -KIND_LABEL_GAP;
  const kindFill = isDark ? textFill : excalidrawPalette.edgeLabel;

  useLayoutEffect(() => {
    const container = containerRef.current;
    const textEl = textRef.current;
    if (!container || !textEl) return;

    const svg = container.ownerSVGElement;
    if (!svg) return;

    const bbox = textEl.getBBox();
    const textHeight = Math.ceil(bbox.height);
    const textWidth = Math.ceil(bbox.width);
    const iconSize = Math.round(textHeight * ICON_SIZE_SCALE);
    const paddedIconWidth = hasKindIcon ? iconSize + PADDING : 0;
    const width = Math.max(80, paddedIconWidth + textWidth + PADDING * 2);
    const height = Math.max(32, textHeight + PADDING * 2);

    if (roughNodeRef.current && roughNodeRef.current.parentNode === container) {
      container.removeChild(roughNodeRef.current);
      roughNodeRef.current = null;
    }

    const rc = rough.svg(svg);
    const roughRect = rc.rectangle(0, 0, width, height, {
      fill: colors.fill,
      fillStyle: 'solid',
      stroke: colors.stroke,
      strokeWidth: 1.5,
      roughness: 1.0,
    });
    container.insertBefore(roughRect, container.firstChild);
    roughNodeRef.current = roughRect;

    setSize({ width, height, iconSize });

    return () => {
      if (
        roughNodeRef.current &&
        roughNodeRef.current.parentNode === container
      ) {
        container.removeChild(roughNodeRef.current);
        roughNodeRef.current = null;
      }
    };
  }, [
    node.id,
    nodeLabel,
    color,
    colors.fill,
    colors.stroke,
    hasKindIcon,
  ]);

  const nodeWithClick = node as { onClick?: (event: MouseEvent<unknown>) => void };
  const onClick = nodeWithClick.onClick;

  const paddedIconWidth = hasKindIcon ? size.iconSize + PADDING : 0;
  const textX =
    paddedIconWidth + (size.width - paddedIconWidth) / 2;
  const iconY = (size.height - size.iconSize) / 2;

  return (
    <g
      ref={containerRef}
      onClick={onClick}
      style={{ cursor: onClick ? 'pointer' : undefined }}
    >
      <title>{node.id}</title>
      <g pointerEvents="none">
        {KindIcon && size.iconSize > 0 && (
          <g transform={`translate(${PADDING}, ${iconY})`}>
            {/* IconComponent in SVG context; SvgIcon accepts width/height via native SVG props */}
            <KindIcon
              {...({
                width: size.iconSize,
                height: size.iconSize,
                style: { color: textFill },
              } as React.ComponentProps<typeof KindIcon>)}
            />
          </g>
        )}
        <text
          ref={textRef}
          x={textX}
          y={size.height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ fontFamily: HAND_DRAWN_FONT, fontSize: 14, fill: textFill }}
        >
          {nodeLabel}
        </text>
      </g>
      {/* Full-size transparent hit area so the entire node is clickable (rough paths have gaps) */}
      <rect
        x={0}
        y={0}
        width={size.width}
        height={size.height}
        fill="transparent"
      />
      {/* Kind label above node */}
      {kindLabel && (
        <text
          x={size.width / 2}
          y={kindTextY}
          textAnchor="middle"
          dominantBaseline="alphabetic"
style={{
              fontSize: KIND_FONT_SIZE,
              fill: kindFill,
            }}
        >
          {kindLabel}
        </text>
      )}
    </g>
  );
}

/**
 * Wrapper with no hooks. Node passes render({ node }) and uses the return value
 * as children, so this function must not use hooks or the node's hook count would vary.
 */
export function ExcalidrawNode(
  props: DependencyGraphTypes.RenderNodeProps<unknown>,
): JSX.Element {
  return <ExcalidrawNodeInner {...props} />;
}
