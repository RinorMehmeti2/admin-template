import type { FieldValues } from 'react-hook-form';

export interface FormWizardSummaryProps<TValues extends FieldValues> {
  values: TValues;
  summaryLabel: string;
}

function formatValue(v: unknown): string {
  if (v === null || v === undefined) return '—';
  if (typeof v === 'boolean') return v ? '✓' : '✗';
  if (v instanceof Date) return v.toISOString();
  if (Array.isArray(v)) return v.length === 0 ? '—' : v.map((x) => formatValue(x)).join(', ');
  if (typeof v === 'object') {
    try {
      return JSON.stringify(v);
    } catch {
      return String(v);
    }
  }
  if (typeof v === 'string' && v.length === 0) return '—';
  return String(v);
}

export function FormWizardSummary<TValues extends FieldValues>({
  values,
  summaryLabel,
}: FormWizardSummaryProps<TValues>) {
  const entries = Object.entries(values);
  return (
    <div data-testid="wizard-summary" className="space-y-3">
      <p className="text-sm text-foreground-muted">{summaryLabel}</p>
      <dl className="divide-y divide-border rounded-md border border-border bg-surface">
        {entries.length === 0 ? (
          <div className="px-4 py-3 text-sm text-foreground-muted">No values to review.</div>
        ) : (
          entries.map(([k, v]) => (
            <div
              key={k}
              className="flex items-baseline justify-between gap-4 px-4 py-2.5 text-sm"
            >
              <dt className="font-medium text-foreground-muted capitalize">
                {k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
              </dt>
              <dd className="text-right text-foreground break-words">{formatValue(v)}</dd>
            </div>
          ))
        )}
      </dl>
    </div>
  );
}
