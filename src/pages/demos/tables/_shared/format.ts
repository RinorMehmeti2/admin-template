import { format } from 'date-fns';
import type {
  DeploymentStatus,
  EmployeeStatus,
  InvoiceStatus,
  OrderStatus,
  ProjectStatus,
} from './model';

type AccentVariant = 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info';

export function employeeStatusVariant(status: EmployeeStatus): AccentVariant {
  if (status === 'active') return 'success';
  if (status === 'on-leave') return 'warning';
  return 'danger';
}

export function orderStatusVariant(status: OrderStatus): AccentVariant {
  if (status === 'pending') return 'warning';
  if (status === 'paid') return 'neutral';
  if (status === 'shipped') return 'info';
  if (status === 'delivered') return 'success';
  return 'danger';
}

export function projectStatusVariant(status: ProjectStatus): AccentVariant {
  if (status === 'planning') return 'info';
  if (status === 'active') return 'primary';
  if (status === 'on-hold') return 'warning';
  return 'success';
}

export function invoiceStatusVariant(status: InvoiceStatus): AccentVariant {
  if (status === 'draft') return 'neutral';
  if (status === 'sent') return 'info';
  if (status === 'paid') return 'success';
  if (status === 'overdue') return 'danger';
  return 'neutral';
}

export function deploymentStatusVariant(status: DeploymentStatus): AccentVariant {
  if (status === 'success') return 'success';
  if (status === 'running') return 'info';
  if (status === 'queued') return 'neutral';
  if (status === 'failed') return 'danger';
  return 'warning';
}

export function formatMoney(amount: number, currency: 'USD' | 'EUR'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
}

export function formatDateShort(d: Date): string {
  return format(d, 'MMM d, yyyy');
}

export function formatDuration(ms: number): string {
  const s = Math.round(ms / 1000);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r}s`;
  return `${m}m ${String(r).padStart(2, '0')}s`;
}
