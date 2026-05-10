import type { Ref } from 'react';
import { Bar, BarChart as RCBarChart, CartesianGrid, Tooltip, XAxis, YAxis } from 'recharts';
import { useChart } from '../shared/useChart';
import { ChartTooltipContent } from '../shared/ChartTooltip';
import { ChartFrame } from '../shared/ChartFrame';
import { describeChart } from '../shared/describe';
import type { ChartCommonProps } from '../shared/types';

export interface BarChartProps extends ChartCommonProps {
  ref?: Ref<HTMLDivElement>;
  /** Vertical bars (default) or horizontal (layout='vertical' in Recharts terms). */
  orientation?: 'horizontal' | 'vertical';
  /** Internal flag used by StackedBarChart. Consumers should use StackedBarChart instead. */
  stacked?: boolean;
  /** Round the top corners of each bar. Default: 4. Pass 0 for square corners. */
  cornerRadius?: number;
}

export function BarChart({
  ref,
  data,
  series,
  xKey,
  yFormatter,
  xFormatter,
  height = 300,
  showGrid = true,
  showLegend = true,
  showTooltip = true,
  ariaLabel,
  className,
  orientation = 'horizontal',
  stacked = false,
  cornerRadius = 4,
  width,
}: BarChartProps) {
  const { colors, hidden, toggle, legendItems, resolvedSeries } = useChart(series);
  const label = ariaLabel ?? describeChart(stacked ? 'stackedBar' : 'bar', series, data.length);
  const isHorizontal = orientation === 'horizontal';

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
      dataChartType={stacked ? 'stacked-bar' : 'bar'}
    >
      {(sizing) => (
        <RCBarChart
          data={data as never}
          layout={isHorizontal ? 'horizontal' : 'vertical'}
          {...sizing}
        >
          {showGrid ? (
            <CartesianGrid
              stroke={colors.border}
              strokeDasharray="3 3"
              vertical={!isHorizontal}
              horizontal={isHorizontal}
            />
          ) : null}
          {isHorizontal ? (
            <>
              <XAxis
                dataKey={xKey}
                stroke={colors.foregroundMuted}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: colors.border }}
                {...(xFormatter !== undefined
                  ? { tickFormatter: (v: unknown) => xFormatter(v) }
                  : {})}
              />
              <YAxis
                stroke={colors.foregroundMuted}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: colors.border }}
                {...(yFormatter !== undefined ? { tickFormatter: yFormatter } : {})}
                width={48}
              />
            </>
          ) : (
            <>
              <XAxis
                type="number"
                stroke={colors.foregroundMuted}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: colors.border }}
                {...(yFormatter !== undefined ? { tickFormatter: yFormatter } : {})}
              />
              <YAxis
                type="category"
                dataKey={xKey}
                stroke={colors.foregroundMuted}
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: colors.border }}
                width={80}
                {...(xFormatter !== undefined
                  ? { tickFormatter: (v: unknown) => xFormatter(v) }
                  : {})}
              />
            </>
          )}
          {showTooltip ? (
            <Tooltip
              cursor={{ fill: colors.surfaceMuted, opacity: 0.5 }}
              content={(props) => (
                <ChartTooltipContent {...props} yFormatter={yFormatter} xFormatter={xFormatter} />
              )}
            />
          ) : null}
          {resolvedSeries.map(({ series: s, color }) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={color}
              radius={[cornerRadius, cornerRadius, 0, 0]}
              {...(stacked ? { stackId: 'stack' } : {})}
              hide={hidden.has(s.key)}
              isAnimationActive={false}
            />
          ))}
        </RCBarChart>
      )}
    </ChartFrame>
  );
}
