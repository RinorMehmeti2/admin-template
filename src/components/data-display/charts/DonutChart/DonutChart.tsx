import type { Ref } from 'react';
import { PieChartImpl } from '../PieChart/PieChartImpl';
import type { SliceChartCommonProps } from '../shared/types';

export interface DonutChartProps extends SliceChartCommonProps {
  ref?: Ref<HTMLDivElement>;
  /** Inner-hole radius in px. Default: 60. Set to 0 to fall back to a Pie. */
  innerRadius?: number;
  outerRadius?: number;
  /** Big number rendered inside the donut hole. */
  centerLabel?: { value: string; sub?: string };
}

export function DonutChart({ innerRadius = 60, outerRadius = 100, ...rest }: DonutChartProps) {
  return (
    <PieChartImpl {...rest} innerRadius={innerRadius} outerRadius={outerRadius} variant="donut" />
  );
}
