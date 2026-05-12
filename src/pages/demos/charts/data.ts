import type { MonthlyPoint, OrderRow, PlanMixPoint, TrafficPoint } from './model';

export const monthly = [
  { month: 'Jan', revenue: 42_000, orders: 320 },
  { month: 'Feb', revenue: 51_000, orders: 380 },
  { month: 'Mar', revenue: 62_000, orders: 470 },
  { month: 'Apr', revenue: 58_000, orders: 440 },
  { month: 'May', revenue: 71_000, orders: 530 },
  { month: 'Jun', revenue: 78_000, orders: 590 },
  { month: 'Jul', revenue: 84_000, orders: 640 },
  { month: 'Aug', revenue: 92_000, orders: 700 },
  { month: 'Sep', revenue: 97_000, orders: 740 },
  { month: 'Oct', revenue: 105_000, orders: 810 },
  { month: 'Nov', revenue: 112_000, orders: 870 },
  { month: 'Dec', revenue: 121_000, orders: 940 },
] satisfies ReadonlyArray<MonthlyPoint>;

export const traffic = [
  { source: 'Direct', visits: 4200 },
  { source: 'Search', visits: 5100 },
  { source: 'Social', visits: 2400 },
  { source: 'Email', visits: 1800 },
  { source: 'Referral', visits: 1100 },
] satisfies ReadonlyArray<TrafficPoint>;

export const planMix = [
  { name: 'Pro', value: 4200, color: 'primary' },
  { name: 'Team', value: 5100, color: 'success' },
  { name: 'Free', value: 2400, color: 'warning' },
  { name: 'Enterprise', value: 800, color: 'info' },
] satisfies ReadonlyArray<PlanMixPoint>;

export const orders = [
  {
    id: 'o-1042',
    customer: 'Acme Corp',
    channel: 'Direct',
    status: 'Paid',
    amount: 1290,
    createdAt: '2026-05-09',
  },
  {
    id: 'o-1041',
    customer: 'Globex',
    channel: 'Search',
    status: 'Paid',
    amount: 459,
    createdAt: '2026-05-09',
  },
  {
    id: 'o-1040',
    customer: 'Initech',
    channel: 'Social',
    status: 'Pending',
    amount: 199,
    createdAt: '2026-05-08',
  },
  {
    id: 'o-1039',
    customer: 'Hooli',
    channel: 'Email',
    status: 'Paid',
    amount: 2_499,
    createdAt: '2026-05-08',
  },
  {
    id: 'o-1038',
    customer: 'Soylent',
    channel: 'Direct',
    status: 'Refunded',
    amount: 89,
    createdAt: '2026-05-07',
  },
  {
    id: 'o-1037',
    customer: 'Pied Piper',
    channel: 'Referral',
    status: 'Paid',
    amount: 749,
    createdAt: '2026-05-07',
  },
  {
    id: 'o-1036',
    customer: 'Stark Industries',
    channel: 'Search',
    status: 'Paid',
    amount: 3_120,
    createdAt: '2026-05-06',
  },
  {
    id: 'o-1035',
    customer: 'Wayne Enterprises',
    channel: 'Direct',
    status: 'Paid',
    amount: 920,
    createdAt: '2026-05-06',
  },
] satisfies ReadonlyArray<OrderRow>;
