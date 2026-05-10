import type { ReactElement, Ref } from 'react';
import { ResponsiveContainer } from 'recharts';
import { cn } from '@/lib/cn';
import { ChartLegend, type ChartLegendItem } from './ChartLegend';

export interface ChartFrameProps {
  ref?: Ref<HTMLDivElement>;
  ariaLabel: string;
  className?: string;
  height: number;
  /** When set, ResponsiveContainer is bypassed — the inner chart is rendered
   *  with this explicit width. Used by jsdom-based tests since
   *  ResponsiveContainer doesn't measure in unlaid-out DOMs. */
  width?: number;
  showLegend: boolean;
  legendItems: ReadonlyArray<ChartLegendItem>;
  hidden: ReadonlySet<string>;
  onToggle: (key: string) => void;
  /** Builder receives the resolved width/height (or undefined for responsive)
   *  so the chart can pass them through to the bare Recharts chart in test
   *  mode without touching ResponsiveContainer. */
  children: (sizing: { width?: number; height: number }) => ReactElement;
  dataChartType: string;
}

export function ChartFrame({
  ref,
  ariaLabel,
  className,
  height,
  width,
  showLegend,
  legendItems,
  hidden,
  onToggle,
  children,
  dataChartType,
}: ChartFrameProps) {
  const inner = children({ height, ...(width !== undefined ? { width } : {}) });

  return (
    <div
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      className={cn('w-full', className)}
      data-chart-type={dataChartType}
    >
      {width !== undefined ? (
        inner
      ) : (
        <ResponsiveContainer width="100%" height={height}>
          {inner}
        </ResponsiveContainer>
      )}
      {showLegend ? <ChartLegend items={legendItems} hidden={hidden} onToggle={onToggle} /> : null}
    </div>
  );
}
