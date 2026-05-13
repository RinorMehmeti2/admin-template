import type { HTMLAttributes, ReactNode, Ref } from 'react';

export type StatCardTrend = 'up' | 'down' | 'flat';
export type StatCardVariant = 'default' | 'outlined' | 'elevated' | 'accent';
export type StatCardSize = 'sm' | 'md' | 'lg';

export interface StatCardProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
  label: ReactNode;
  /** Numeric value — animates between renders. Use `formatValue` for display formatting. */
  value: number;
  /** Static display override. If provided, skips counter animation. */
  displayValue?: ReactNode;
  /** Format the animated number for display. Default `Intl.NumberFormat`. */
  formatValue?: (n: number) => string;
  /** Trailing units (%, $, etc.) — rendered after the number. */
  unit?: ReactNode;
  /** Delta vs comparison period. Auto-classified into tone. */
  delta?: number;
  /** Override auto tone classification. */
  trend?: StatCardTrend;
  /** Format the delta. Default signed percentage. */
  formatDelta?: (n: number) => string;
  /** Label for the delta context (e.g. "vs last week"). */
  deltaLabel?: ReactNode;
  /** Icon shown top-right. */
  icon?: ReactNode;
  /** Optional slot rendered to the right of the value — sparkline / chart. */
  sparkline?: ReactNode;
  /** Optional values for built-in sparkline. Ignored when `sparkline` is provided. */
  sparklineData?: number[];
  /** Render the card as a clickable surface. */
  onClick?: () => void;
  variant?: StatCardVariant;
  size?: StatCardSize;
  /** Loading skeleton state. */
  loading?: boolean;
  /** Disable the counter tween, snap to value. Default false. */
  animate?: boolean;
}
