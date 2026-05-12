import type { ChartColorName } from '@/components/data-display/charts';

export type OrderChannel = 'Direct' | 'Search' | 'Social' | 'Email' | 'Referral';
export type OrderStatus = 'Paid' | 'Refunded' | 'Pending';

export interface OrderRow {
  id: string;
  customer: string;
  channel: OrderChannel;
  status: OrderStatus;
  amount: number;
  createdAt: string;
}

export interface MonthlyPoint {
  month: string;
  revenue: number;
  orders: number;
}

export interface TrafficPoint {
  source: OrderChannel;
  visits: number;
}

export interface PlanMixPoint {
  name: string;
  value: number;
  color: ChartColorName;
}
