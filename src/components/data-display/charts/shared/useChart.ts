import { useCallback, useMemo, useState } from 'react';
import { useChartContext } from './ChartContext';
import { useTokenColors, type TokenColorMap } from './useTokenColors';
import type { ChartLegendItem } from './ChartLegend';
import type { ChartSeries } from './types';
import { resolveSeriesColor } from './ChartContext';

export interface UseChartReturn {
  colors: TokenColorMap;
  hidden: ReadonlySet<string>;
  toggle: (key: string) => void;
  isHidden: (key: string) => boolean;
  legendItems: ReadonlyArray<ChartLegendItem>;
  resolvedSeries: ReadonlyArray<{
    series: ChartSeries;
    color: string;
    hidden: boolean;
  }>;
}

/**
 * Resolves token colours, manages legend visibility toggles, and produces a
 * pre-coloured `resolvedSeries` list for chart components to render.
 *
 * If a `<ChartContainer>` ancestor exists, its colour map is reused; otherwise
 * the chart self-resolves via `useTokenColors`.
 */
export function useChart(series: ReadonlyArray<ChartSeries>): UseChartReturn {
  const ctx = useChartContext();
  const standalone = useTokenColors();
  const colors = ctx?.colors ?? standalone;

  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set<string>());

  const toggle = useCallback((key: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const isHidden = useCallback((key: string) => hidden.has(key), [hidden]);

  const resolvedSeries = useMemo(
    () =>
      series.map((s, i) => ({
        series: s,
        color: resolveSeriesColor(colors, s, i),
        hidden: hidden.has(s.key),
      })),
    [series, colors, hidden],
  );

  const legendItems = useMemo<ReadonlyArray<ChartLegendItem>>(
    () => resolvedSeries.map(({ series: s, color }) => ({ key: s.key, label: s.label, color })),
    [resolvedSeries],
  );

  return { colors, hidden, toggle, isHidden, legendItems, resolvedSeries };
}
