import {
  Activity,
  CreditCard,
  DollarSign,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react';

export const KPIS = [
  {
    label: 'Revenue',
    value: '$48,210',
    delta: 12.4,
    deltaLabel: 'vs previous 30 days',
    icon: <DollarSign className="h-4 w-4" />,
  },
  {
    label: 'Active users',
    value: '2,140',
    delta: -3.1,
    deltaLabel: 'vs previous 30 days',
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: 'Orders',
    value: '148',
    delta: 6.8,
    deltaLabel: 'vs previous 30 days',
    icon: <ShoppingCart className="h-4 w-4" />,
  },
  {
    label: 'Avg. order value',
    value: '$326',
    delta: 0,
    deltaLabel: 'vs previous 30 days',
    icon: <CreditCard className="h-4 w-4" />,
  },
] as const;

export const ACTIVITY = [
  {
    id: 1,
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    action: 'created order #4920',
    when: '2m ago',
    badge: { variant: 'success' as const, label: 'Paid' },
  },
  {
    id: 2,
    name: 'Grace Hopper',
    email: 'grace@example.com',
    action: 'refunded order #4918',
    when: '14m ago',
    badge: { variant: 'warning' as const, label: 'Refund' },
  },
  {
    id: 3,
    name: 'Linus Torvalds',
    email: 'linus@example.com',
    action: 'updated billing details',
    when: '1h ago',
    badge: { variant: 'neutral' as const, label: 'Profile' },
  },
  {
    id: 4,
    name: 'Margaret Hamilton',
    email: 'margaret@example.com',
    action: 'created order #4915',
    when: '3h ago',
    badge: { variant: 'success' as const, label: 'Paid' },
  },
];

export const QUICK_STATS = [
  { label: 'Sessions today', value: '4,820', delta: 4.1, icon: <Activity className="h-5 w-5" /> },
  { label: 'Pending orders', value: '12', delta: -2, icon: <Package className="h-5 w-5" /> },
  { label: 'New signups', value: '38', delta: 17.2, icon: <Users className="h-5 w-5" /> },
];
