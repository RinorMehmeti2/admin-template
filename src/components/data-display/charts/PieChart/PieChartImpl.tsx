import { useCallback, useMemo, useState, type Ref } from 'react';
import { Cell, Pie, PieChart as RCPieChart, Tooltip } from 'recharts';
import { useChartContext } from '../shared/ChartContext';
import { useTokenColors } from '../shared/useTokenColors';
import { ChartTooltipContent } from '../shared/ChartTooltip';
import { ChartFrame } from '../shared/ChartFrame';
import { describeSliceChart } from '../shared/describe';
import { SLICE_PALETTE } from '../shared/types';
import type { ChartColorName, SliceChartCommonProps, SliceRow } from '../shared/types';
import type { ChartLegendItem } from '../shared/ChartLegend';

export interface PieChartImplProps extends SliceChartCommonProps {
  ref?: Ref<HTMLDivElement>;
  /** Inner radius — 0 for Pie, > 0 for Donut. Pixels. */
  innerRadius?: number;
  /** Outer radius. Pixels. */
  outerRadius?: number;
  /** Optional centre label inside donut hole. */
  centerLabel?: { value: string; sub?: string };
  /** chart-type marker for data-attr / aria. */
  variant: 'pie' | 'donut';
}

export function PieChartImpl({
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
  innerRadius = 0,
  outerRadius,
  centerLabel,
  variant,
}: PieChartImplProps) {
  const ctx = useChartContext();
  const standalone = useTokenColors();
  const colors = ctx?.colors ?? standalone;

  const valueKey = series[0]?.key ?? 'value';
  const valueLabel = series[0]?.label ?? 'Value';

  // Each row → slice. Resolve colour from row.color, else palette rotation.
  const sliceRows = useMemo(
    () =>
      data.map((row, i) => {
        const declared = row.color as ChartColorName | undefined;
        const fallback = SLICE_PALETTE[i % SLICE_PALETTE.length] ?? 'primary';
        const colorName: ChartColorName = declared ?? fallback;
        return {
          row,
          color: colors[colorName],
          name: String(row[xKey] ?? ''),
        };
      }),
    [data, colors, xKey],
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
    () => sliceRows.filter((s) => !hidden.has(s.name)).map((s) => s.row),
    [sliceRows, hidden],
  );

  const legendItems = useMemo<ReadonlyArray<ChartLegendItem>>(
    () => sliceRows.map((s) => ({ key: s.name, label: s.name, color: s.color })),
    [sliceRows],
  );

  const label = ariaLabel ?? describeSliceChart(variant, data.length, valueLabel);

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
      dataChartType={variant}
    >
      {(sizing) => (
        <RCPieChart {...sizing}>
          {showTooltip ? (
            <Tooltip
              content={(props) => <ChartTooltipContent {...props} yFormatter={yFormatter} />}
            />
          ) : null}
          <Pie
            data={visibleData as never}
            dataKey={valueKey}
            nameKey={xKey}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            {...(outerRadius !== undefined ? { outerRadius } : {})}
            paddingAngle={innerRadius > 0 ? 2 : 0}
            stroke={colors.background}
            strokeWidth={2}
            isAnimationActive={false}
          >
            {visibleData.map((row) => {
              const name = String(row[xKey] ?? '');
              const slice = sliceRows.find((s) => s.name === name);
              return <Cell key={`cell-${name}`} fill={slice?.color ?? colors.primary} />;
            })}
          </Pie>
          {variant === 'donut' && centerLabel !== undefined ? (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground"
            >
              <tspan x="50%" dy="-0.2em" className="text-xl font-semibold fill-foreground">
                {centerLabel.value}
              </tspan>
              {centerLabel.sub !== undefined ? (
                <tspan x="50%" dy="1.6em" className="text-xs fill-foreground-muted">
                  {centerLabel.sub}
                </tspan>
              ) : null}
            </text>
          ) : null}
        </RCPieChart>
      )}
    </ChartFrame>
  );
}

// re-export type for sub-components
export type { SliceRow };
