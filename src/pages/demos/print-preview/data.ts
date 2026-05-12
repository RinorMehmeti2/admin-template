import type { InvoiceRow } from './model';

export const INVOICES: InvoiceRow[] = [
  { id: 'INV-1042', customer: 'Acme Corp', amount: 12_400, status: 'paid', issued: '2026-04-12' },
  { id: 'INV-1043', customer: 'Globex', amount: 3_280, status: 'paid', issued: '2026-04-15' },
  { id: 'INV-1044', customer: 'Initech', amount: 7_800, status: 'pending', issued: '2026-04-18' },
  { id: 'INV-1045', customer: 'Umbrella', amount: 1_120, status: 'overdue', issued: '2026-03-30' },
  {
    id: 'INV-1046',
    customer: 'Stark Industries',
    amount: 24_000,
    status: 'paid',
    issued: '2026-04-22',
  },
  {
    id: 'INV-1047',
    customer: 'Wayne Enterprises',
    amount: 9_950,
    status: 'pending',
    issued: '2026-04-25',
  },
  { id: 'INV-1048', customer: 'Cyberdyne', amount: 5_400, status: 'paid', issued: '2026-04-29' },
  { id: 'INV-1049', customer: 'Hooli', amount: 2_780, status: 'overdue', issued: '2026-04-02' },
  {
    id: 'INV-1050',
    customer: 'Pied Piper',
    amount: 6_120,
    status: 'pending',
    issued: '2026-05-01',
  },
  {
    id: 'INV-1051',
    customer: 'Massive Dynamic',
    amount: 18_300,
    status: 'paid',
    issued: '2026-05-03',
  },
  { id: 'INV-1052', customer: 'Soylent', amount: 4_650, status: 'paid', issued: '2026-05-04' },
  { id: 'INV-1053', customer: 'Vandelay', amount: 870, status: 'overdue', issued: '2026-04-09' },
];

export const REVENUE_BY_MONTH = [
  { month: 'Jan', revenue: 32_000, expenses: 18_400 },
  { month: 'Feb', revenue: 38_500, expenses: 19_200 },
  { month: 'Mar', revenue: 41_700, expenses: 22_100 },
  { month: 'Apr', revenue: 47_200, expenses: 23_900 },
  { month: 'May', revenue: 51_900, expenses: 24_600 },
];

export const SIGNUPS = [
  { day: 'Mon', signups: 84 },
  { day: 'Tue', signups: 102 },
  { day: 'Wed', signups: 96 },
  { day: 'Thu', signups: 124 },
  { day: 'Fri', signups: 138 },
  { day: 'Sat', signups: 73 },
  { day: 'Sun', signups: 61 },
];

export const PLAN_BREAKDOWN = [
  { name: 'Starter', value: 412, color: 'info' as const },
  { name: 'Pro', value: 268, color: 'primary' as const },
  { name: 'Business', value: 96, color: 'success' as const },
  { name: 'Enterprise', value: 18, color: 'warning' as const },
];

export const formatUsd = (n: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(n);

export function statusVariant(status: InvoiceRow['status']): 'success' | 'warning' | 'danger' {
  if (status === 'paid') return 'success';
  if (status === 'pending') return 'warning';
  return 'danger';
}
