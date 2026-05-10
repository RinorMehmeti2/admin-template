import type { Ref } from 'react';
import { CartesianGrid, Line, LineChart as RCLineChart, Tooltip, XAxis, YAxis } from 'recharts';
import { useChart } from '../shared/useChart';
import { ChartTooltipContent } from '../shared/ChartTooltip';
import { ChartFrame } from '../shared/ChartFrame';
import { describeChart } from '../shared/describe';
import type { ChartCommonProps } from '../shared/types';

export interface LineChartProps extends ChartCommonProps {
  ref?: Ref<HTMLDivElement>;
  /** Smooth curves between points. Default: true. */
  smooth?: boolean;
  /** Render a dot at each data point. Default: false (cleaner at higher density). */
  showDots?: boolean;
}

export function LineChart({
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
  showDots = false,
  width,
}: LineChartProps) {
  const { colors, hidden, toggle, legendItems, resolvedSeries } = useChart(series);
  const label = ariaLabel ?? describeChart('line', series, data.length);

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
      dataChartType="line"
    >
      {(sizing) => (
        <RCLineChart data={data as never} {...sizing}>
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
            <Line
              key={s.key}
              type={smooth ? 'monotone' : 'linear'}
              dataKey={s.key}
              name={s.label}
              stroke={color}
              strokeWidth={2}
              dot={showDots ? { fill: color, r: 3 } : false}
              activeDot={{ r: 4, stroke: colors.surface, strokeWidth: 2, fill: color }}
              hide={hidden.has(s.key)}
              isAnimationActive={false}
            />
          ))}
        </RCLineChart>
      )}
    </ChartFrame>
  );
}
