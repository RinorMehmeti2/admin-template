import type { Ref } from 'react';
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart as RCComposedChart,
  Line,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useChart } from '../shared/useChart';
import { ChartTooltipContent } from '../shared/ChartTooltip';
import { ChartFrame } from '../shared/ChartFrame';
import { describeChart } from '../shared/describe';
import type { ChartCommonProps } from '../shared/types';

export interface ComposedChartProps extends ChartCommonProps {
  ref?: Ref<HTMLDivElement>;
  /** Bar corner radius for any bar series. Default 4. */
  barCornerRadius?: number;
}

export function ComposedChart({
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
  width,
  barCornerRadius = 4,
}: ComposedChartProps) {
  const { colors, hidden, toggle, legendItems, resolvedSeries } = useChart(series);
  const label = ariaLabel ?? describeChart('composed', series, data.length);

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
      dataChartType="composed"
    >
      {(sizing) => (
        <RCComposedChart data={data as never} {...sizing}>
          <defs>
            {resolvedSeries
              .filter(({ series: s }) => s.type === 'area')
              .map(({ series: s, color }) => (
                <linearGradient
                  id={`composed-area-${s.key}`}
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
          {resolvedSeries.map(({ series: s, color }) => {
            const t = s.type ?? 'line';
            if (t === 'bar') {
              return (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  name={s.label}
                  fill={color}
                  radius={[barCornerRadius, barCornerRadius, 0, 0]}
                  hide={hidden.has(s.key)}
                  isAnimationActive={false}
                />
              );
            }
            if (t === 'area') {
              return (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.label}
                  stroke={color}
                  strokeWidth={2}
                  fill={`url(#composed-area-${s.key})`}
                  fillOpacity={1}
                  hide={hidden.has(s.key)}
                  isAnimationActive={false}
                />
              );
            }
            return (
              <Line
                key={s.key}
                type="monotone"
                dataKey={s.key}
                name={s.label}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, stroke: colors.surface, strokeWidth: 2, fill: color }}
                hide={hidden.has(s.key)}
                isAnimationActive={false}
              />
            );
          })}
        </RCComposedChart>
      )}
    </ChartFrame>
  );
}
