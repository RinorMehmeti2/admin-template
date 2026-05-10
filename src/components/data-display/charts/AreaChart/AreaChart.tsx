import type { Ref } from 'react';
import {
  Area,
  AreaChart as RCAreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChart } from '../shared/useChart';
import { ChartTooltipContent } from '../shared/ChartTooltip';
import { ChartFrame } from '../shared/ChartFrame';
import { describeChart } from '../shared/describe';
import type { ChartCommonProps } from '../shared/types';

export interface AreaChartProps extends ChartCommonProps {
  ref?: Ref<HTMLDivElement>;
  smooth?: boolean;
  /** Stack series into a cumulative area chart. Default: false. */
  stacked?: boolean;
}

export function AreaChart({
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
  smooth = true,
  stacked = false,
  width,
}: AreaChartProps) {
  const { colors, hidden, toggle, legendItems, resolvedSeries } = useChart(series);
  const label = ariaLabel ?? describeChart('area', series, data.length);

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
      dataChartType="area"
    >
      {(sizing) => (
        <RCAreaChart data={data as never} {...sizing}>
          <defs>
            {resolvedSeries.map(({ series: s, color }) => (
              <linearGradient
                id={`area-${s.key}-gradient`}
                key={`grad-${s.key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={color} stopOpacity={0.05} />
              </linearGradient>
            ))}
          </defs>
          {showGrid ? (
            <CartesianGrid stroke={colors.border} strokeDasharray="3 3" vertical={false} />
          ) : null}
          <XAxis
            dataKey={xKey}
            stroke={colors.foregroundMuted}
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
            {...(xFormatter !== undefined ? { tickFormatter: (v: unknown) => xFormatter(v) } : {})}
          />
          <YAxis
            stroke={colors.foregroundMuted}
            fontSize={12}
            tickLine={false}
            axisLine={{ stroke: colors.border }}
            {...(yFormatter !== undefined ? { tickFormatter: yFormatter } : {})}
            width={48}
          />
          {showTooltip ? (
            <Tooltip
              cursor={{ stroke: colors.borderStrong, strokeDasharray: '4 4' }}
              content={(props) => (
                <ChartTooltipContent {...props} yFormatter={yFormatter} xFormatter={xFormatter} />
              )}
            />
          ) : null}
          {resolvedSeries.map(({ series: s, color }) => (
            <Area
              key={s.key}
              type={smooth ? 'monotone' : 'linear'}
              dataKey={s.key}
              name={s.label}
              stroke={color}
              strokeWidth={2}
              fill={`url(#area-${s.key}-gradient)`}
              fillOpacity={1}
              {...(stacked ? { stackId: 'stack' } : {})}
              hide={hidden.has(s.key)}
              isAnimationActive={false}
            />
          ))}
        </RCAreaChart>
      )}
    </ChartFrame>
  );
}
