import type { ActiveFilter, FilterDef } from '@/components/data-display';
import type { LogEntry } from './model';

const SERVICES = ['api', 'auth', 'billing', 'worker', 'web'] as const;

function makeLogs(): LogEntry[] {
  const seeds = [
    'Failed login attempt',
    'Webhook delivered',
    'Cache miss on user profile',
    'Slow database query',
    'Background job retried',
    'Permission denied on resource',
    'Invitation email queued',
    'Stripe charge succeeded',
    'Schema migration applied',
    'Rate limit exceeded',
    'Service restarted',
    'Auth token refreshed',
  ];
  const tags = ['prod', 'staging', 'canary', 'internal'];
  return Array.from({ length: 50 }).map((_, i) => {
    const d = new Date();
    d.setHours(d.getHours() - i * 3);
    return {
      id: `log-${i}`,
      message: seeds[i % seeds.length]!,
      level: (['info', 'warn', 'error'] as const)[i % 3]!,
      service: SERVICES[i % SERVICES.length]!,
      tags: [tags[i % tags.length]!, tags[(i + 1) % tags.length]!],
      createdAt: d,
    };
  });
}

export const LOGS = makeLogs();

export const FILTERS: ReadonlyArray<FilterDef> = [
  {
    id: 'level',
    label: 'Level',
    type: 'select',
    options: [
      { value: 'info', label: 'Info' },
      { value: 'warn', label: 'Warn' },
      { value: 'error', label: 'Error' },
    ],
  },
  {
    id: 'service',
    label: 'Service',
    type: 'multi-select',
    options: SERVICES.map((s) => ({ value: s, label: s })),
  },
  { id: 'tag', label: 'Tag', type: 'text', placeholder: 'tag contains…' },
  { id: 'created', label: 'Created', type: 'date-range' },
];

export const levelVariant: Record<LogEntry['level'], 'info' | 'warning' | 'danger'> = {
  info: 'info',
  warn: 'warning',
  error: 'danger',
};

export function applyFilters(
  rows: ReadonlyArray<LogEntry>,
  q: string,
  active: ReadonlyArray<ActiveFilter>,
): LogEntry[] {
  const query = q.trim().toLowerCase();
  return rows.filter((r) => {
    if (query !== '' && !r.message.toLowerCase().includes(query)) return false;
    for (const af of active) {
      if (af.id === 'level' && typeof af.value === 'string' && af.value !== '') {
        if (r.level !== af.value) return false;
      } else if (af.id === 'service' && Array.isArray(af.value) && af.value.length > 0) {
        if (!af.value.includes(r.service)) return false;
      } else if (af.id === 'tag' && typeof af.value === 'string' && af.value !== '') {
        const needle = af.value.toLowerCase();
        if (!r.tags.some((t) => t.toLowerCase().includes(needle))) return false;
      } else if (
        af.id === 'created' &&
        af.value !== null &&
        af.value !== undefined &&
        typeof af.value === 'object' &&
        !Array.isArray(af.value)
      ) {
        const range = af.value as { from: Date | null; to: Date | null };
        if (range.from !== null && r.createdAt < range.from) return false;
        if (range.to !== null && r.createdAt > range.to) return false;
      }
    }
    return true;
  });
}
