import { useCallback, useMemo, useState, type Ref } from 'react';
import { RadialBar, RadialBarChart as RCRadialBarChart, Tooltip, PolarAngleAxis } from 'recharts';
import { useChartContext } from '../shared/ChartContext';
import { useTokenColors } from '../shared/useTokenColors';
import { ChartTooltipContent } from '../shared/ChartTooltip';
import { ChartFrame } from '../shared/ChartFrame';
import { describeSliceChart } from '../shared/describe';
import { SLICE_PALETTE } from '../shared/types';
import type { ChartColorName, SliceChartCommonProps } from '../shared/types';
import type { ChartLegendItem } from '../shared/ChartLegend';

export interface RadialChartProps extends SliceChartCommonProps {
  ref?: Ref<HTMLDivElement>;
  /** Pixel inner radius. Default: 30. */
  innerRadius?: number;
  /** Pixel outer radius. Default: 110. */
  outerRadius?: number;
  /** Domain max for the angle axis — e.g. 100 for percent gauges. Default: auto. */
  domainMax?: number;
  /** Sweep arc start. Recharts default 0 = 3 o'clock — we default to 90 (top). */
  startAngle?: number;
  /** Sweep arc end. Default startAngle - 360 (full clockwise sweep). */
  endAngle?: number;
}

export function RadialChart({
  ref,
  data,
  series,
  xKey,
  yFormatter,
  height = 300,
  showLegend = true,
  showTooltip = true,
  ariaLabel,
  className,
  width,
  innerRadius = 30,
  outerRadius = 110,
  domainMax,
  startAngle = 90,
  endAngle = -270,
}: RadialChartProps) {
  const ctx = useChartContext();
  const standalone = useTokenColors();
  const colors = ctx?.colors ?? standalone;

  const valueKey = series[0]?.key ?? 'value';
  const valueLabel = series[0]?.label ?? 'Value';

  // Resolve a fill colour per row, then materialise it as a `fill` attribute
  // on each row — RadialBar reads `fill` from the row when no global fill is set.
  const dataWithFill = useMemo<ReadonlyArray<Record<string, unknown>>>(
    () =>
      data.map((row, i) => {
        const declared = row.color as ChartColorName | undefined;
        const fallback = SLICE_PALETTE[i % SLICE_PALETTE.length] ?? 'primary';
        const colorName: ChartColorName = declared ?? fallback;
        return { ...row, fill: colors[colorName] };
      }),
    [data, colors],
  );

  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set<string>());
  const toggle = useCallback((key: string) => {
    setHidden((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const visibleData = useMemo(
    () =>
      dataWithFill.filter((row) => {
        const name = String(row[xKey] ?? '');
        return !hidden.has(name);
      }),
    [dataWithFill, hidden, xKey],
  );

  const legendItems = useMemo<ReadonlyArray<ChartLegendItem>>(
    () =>
      dataWithFill.map((row) => ({
        key: String(row[xKey] ?? ''),
        label: String(row[xKey] ?? ''),
        color: String(row.fill),
      })),
    [dataWithFill, xKey],
  );

  const label = ariaLabel ?? describeSliceChart('radial', data.length, valueLabel);

  return (
    <ChartFrame
      {...(ref !== undefined ? { ref } : {})}
      ariaLabel={label}
      {...(className !== undefined ? { className } : {})}
      height={height}
      {...(width !== undefined ? { width } : {})}
      showLegend={showLegend}
      legendItems={legendItems}
      hidden={hidden}
      onToggle={toggle}
      dataChartType="radial"
    >
      {(sizing) => (
        <RCRadialBarChart
          data={visibleData as never}
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          {...sizing}
        >
          {domainMax !== undefined ? (
            <PolarAngleAxis type="number" domain={[0, domainMax]} angleAxisId={0} tick={false} />
          ) : null}
          {showTooltip ? (
            <Tooltip
              content={(props) => <ChartTooltipContent {...props} yFormatter={yFormatter} />}
            />
          ) : null}
          <RadialBar
            dataKey={valueKey}
            background={{ fill: colors.surfaceMuted }}
            cornerRadius={6}
            isAnimationActive={false}
          />
        </RCRadialBarChart>
      )}
    </ChartFrame>
  );
}
