import type { ChartSeries } from './types';

const TYPE_NOUN: Record<string, string> = {
  line: 'Line chart',
  area: 'Area chart',
  bar: 'Bar chart',
  stackedBar: 'Stacked bar chart',
  pie: 'Pie chart',
  donut: 'Donut chart',
  radial: 'Radial bar chart',
  composed: 'Composed chart',
};

/**
 * Build an accessible label like
 *   "Line chart of Revenue, Profit over 12 entries"
 * unless the consumer overrode it.
 */
export function describeChart(
  chartType: keyof typeof TYPE_NOUN,
  series: ReadonlyArray<ChartSeries>,
  rowCount: number,
): string {
  const noun = TYPE_NOUN[chartType] ?? 'Chart';
  if (series.length === 0) return `${noun} (empty)`;
  const labels = series.map((s) => s.label);
  const subject =
    labels.length === 1
      ? labels[0]
      : labels.length === 2
        ? `${labels[0]} and ${labels[1]}`
        : `${labels.slice(0, -1).join(', ')}, and ${labels[labels.length - 1]}`;
  const period = rowCount === 1 ? '1 entry' : `${rowCount} entries`;
  return `${noun} of ${subject} over ${period}`;
}

export function describeSliceChart(
  chartType: 'pie' | 'donut' | 'radial',
  rowCount: number,
  valueLabel: string,
): string {
  const noun = TYPE_NOUN[chartType] ?? 'Chart';
  return `${noun} showing ${valueLabel} across ${rowCount} ${rowCount === 1 ? 'category' : 'categories'}`;
}
