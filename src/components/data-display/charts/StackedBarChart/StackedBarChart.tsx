import type { Ref } from 'react';
import { BarChart, type BarChartProps } from '../BarChart/BarChart';

export interface StackedBarChartProps extends Omit<BarChartProps, 'stacked'> {
  ref?: Ref<HTMLDivElement>;
}

/**
 * Sugar over `<BarChart stacked />` with corner-radius defaulted to 0
 * (rounded tops on stacked segments look broken).
 */
export function StackedBarChart({ cornerRadius = 0, ...rest }: StackedBarChartProps) {
  return <BarChart {...rest} stacked cornerRadius={cornerRadius} />;
}
