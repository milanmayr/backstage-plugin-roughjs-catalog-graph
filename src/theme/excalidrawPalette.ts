/**
 * Excalidraw-aligned color palette for light and dark theme.
 * Values match official Excalidraw theme.scss:
 * https://github.com/excalidraw/excalidraw/blob/master/packages/excalidraw/css/theme.scss
 */

export interface ExcalidrawPalette {
  /** Primary text / node labels (--color-on-surface) */
  colorOnSurface: string;
  /** Node "primary" variant: fill and stroke */
  nodePrimary: { fill: string; stroke: string };
  /** Node "secondary" variant: fill and stroke (--color-surface-high, --color-border-outline) */
  nodeSecondary: { fill: string; stroke: string };
  /** Node "default" variant: neutral fill and stroke */
  nodeDefault: { fill: string; stroke: string };
  /** Edge path stroke (--color-border-outline) */
  edgeStroke: string;
  /** Edge label text (muted gray) */
  edgeLabel: string;
}

const LIGHT: ExcalidrawPalette = {
  colorOnSurface: '#1b1b1f',
  nodePrimary: {
    fill: '#e3e2fe', // --color-primary-light
    stroke: '#6965db', // --color-primary
  },
  nodeSecondary: {
    fill: '#f1f0ff', // --color-surface-high
    stroke: '#767680', // --color-border-outline
  },
  nodeDefault: {
    fill: '#ebebeb', // --color-gray-20
    stroke: '#7a7a7a', // --color-gray-60
  },
  edgeStroke: '#767680', // --color-border-outline
  edgeLabel: '#5c5c5c', // --color-gray-70
};

const DARK: ExcalidrawPalette = {
  colorOnSurface: '#e3e3e8',
  nodePrimary: {
    fill: '#4f4d6f', // --color-primary-light
    stroke: '#a8a5ff', // --color-primary
  },
  nodeSecondary: {
    fill: '#2e2d39', // --color-surface-high
    stroke: '#8e8d9c', // --color-border-outline
  },
  nodeDefault: {
    fill: '#3d3d3d', // --color-gray-80
    stroke: '#7a7a7a', // --color-gray-60 (unchanged in dark for neutral)
  },
  edgeStroke: '#8e8d9c', // --color-border-outline
  edgeLabel: '#b8b8b8', // --color-gray-40
};

export function getExcalidrawPalette(isDark: boolean): ExcalidrawPalette {
  return isDark ? DARK : LIGHT;
}
