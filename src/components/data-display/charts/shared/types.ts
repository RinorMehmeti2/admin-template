/**
 * Shared types for the chart family. All chart components consume the same
 * vocabulary so consumers learn one API.
 */

export type ChartColorName =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral';

export interface ChartSeries {
  /** The column in `data` this series reads from. */
  key: string;
  /** Human-readable name shown in tooltip + legend. */
  label: string;
  /** Token-bound colour. Resolved at render time so dark mode swaps free. */
  color?: ChartColorName;
  /** Per-series visual type. ComposedChart only — ignored elsewhere. */
  type?: 'line' | 'area' | 'bar';
}

export interface ChartCommonProps {
  data: ReadonlyArray<Record<string, unknown>>;
  series: ReadonlyArray<ChartSeries>;
  /** Column on each row used as the categorical / time axis. */
  xKey: string;
  yFormatter?: (v: number) => string;
  xFormatter?: (v: unknown) => string;
  /** Pixel height; default 300. */
  height?: number;
  showGrid?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  /** Override the auto-generated aria-label. */
  ariaLabel?: string;
  className?: string;
  /** Test escape hatch — when set, ResponsiveContainer is bypassed. */
  width?: number;
}

/**
 * Per-row pie/donut/radial slice. Slice charts pivot on rows, not columns,
 * so they accept an extended row shape that may include a `color` override.
 */
export type SliceRow = Record<string, unknown> & {
  color?: ChartColorName;
};

export interface SliceChartCommonProps extends Omit<
  ChartCommonProps,
  'series' | 'data' | 'showGrid'
> {
  data: ReadonlyArray<SliceRow>;
  /** Single series describing the value column. */
  series: ReadonlyArray<ChartSeries>;
}

/** Default slice colour rotation when a slice doesn't specify one. */
export const SLICE_PALETTE: ReadonlyArray<ChartColorName> = [
  'primary',
  'success',
  'info',
  'warning',
  'danger',
  'secondary',
  'neutral',
];

/** Default series colour rotation when a series doesn't specify one. */
export const SERIES_PALETTE: ReadonlyArray<ChartColorName> = [
  'primary',
  'info',
  'success',
  'warning',
  'danger',
  'secondary',
  'neutral',
];
