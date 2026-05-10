import { createContext, useContext } from 'react';
import type { TokenColorMap } from './useTokenColors';
import type { ChartColorName, ChartSeries } from './types';
import { SERIES_PALETTE } from './types';

export interface ChartContextValue {
  colors: TokenColorMap;
}

export const ChartContext = createContext<ChartContextValue | null>(null);

export function useChartContext(): ChartContextValue | null {
  return useContext(ChartContext);
}

/** Resolve a (possibly omitted) series colour name to a concrete hex/rgb string. */
export function resolveSeriesColor(
  colors: TokenColorMap,
  series: ChartSeries,
  seriesIndex: number,
): string {
  const name: ChartColorName =
    series.color ?? SERIES_PALETTE[seriesIndex % SERIES_PALETTE.length] ?? 'primary';
  return colors[name];
}

export function resolveColor(colors: TokenColorMap, name: ChartColorName): string {
  return colors[name];
}
