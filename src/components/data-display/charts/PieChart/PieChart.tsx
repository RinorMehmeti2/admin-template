import type { Ref } from 'react';
import { PieChartImpl } from './PieChartImpl';
import type { SliceChartCommonProps } from '../shared/types';

export interface PieChartProps extends SliceChartCommonProps {
  ref?: Ref<HTMLDivElement>;
  innerRadius?: number;
  outerRadius?: number;
}

export function PieChart(props: PieChartProps) {
  return <PieChartImpl {...props} variant="pie" />;
}
