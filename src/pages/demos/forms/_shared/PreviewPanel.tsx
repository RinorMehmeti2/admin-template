import { useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, ChevronUp, Eye } from 'lucide-react';
import { useFormState, useWatch, type FieldValues, type UseFormReturn } from 'react-hook-form';
import { Badge } from '@/components/primitives/Badge';
import { cn } from '@/lib/cn';

export interface PreviewPanelProps<T extends FieldValues> {
  form: UseFormReturn<T>;
  /** Optional initial open state. Defaults to true on desktop, false on mobile. */
  defaultOpen?: boolean;
  className?: string;
  /** Extra slot rendered below the values block. */
  extra?: ReactNode;
}

function formatErrors(errors: Record<string, unknown>): Array<{ name: string; message: string }> {
  const out: Array<{ name: string; message: string }> = [];
  const walk = (obj: unknown, prefix: string): void => {
    if (obj === null || obj === undefined) return;
    if (typeof obj !== 'object') return;
    const record = obj as Record<string, unknown>;
    if (typeof record.message === 'string') {
      out.push({ name: prefix === '' ? '(root)' : prefix, message: record.message });
      return;
    }
    for (const [key, val] of Object.entries(record)) {
      if (key === 'ref' || key === 'type') continue;
      walk(val, prefix === '' ? key : `${prefix}.${key}`);
    }
  };
  walk(errors, '');
  return out;
}

/**
 * Live read-out of an RHF form's current state. Drop next to every demo
 * form so consumers can see what would post.
 */
export function PreviewPanel<T extends FieldValues>({
  form,
  defaultOpen = true,
  className,
  extra,
}: PreviewPanelProps<T>) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(defaultOpen);
  const values = useWatch({ control: form.control }) as Partial<T>;
  const { errors, isDirty, isValid, isSubmitting } = useFormState({ control: form.control });
  const errorList = formatErrors(errors as Record<string, unknown>);

  return (
    <aside
      aria-label={t('forms.preview.title')}
      data-print="hide"
      className={cn(
        'mt-6 rounded-lg border border-border bg-surface-muted/30',
        open ? 'p-4' : 'px-4 py-2',
        className,
      )}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-foreground-muted" aria-hidden="true" />
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            {t('forms.preview.title')}
          </h3>
          <div className="flex items-center gap-1">
            {isDirty ? (
              <Badge size="sm" variant="info">
                {t('forms.preview.dirty')}
              </Badge>
            ) : null}
            {isValid ? (
              <Badge size="sm" variant="success">
                {t('forms.preview.valid')}
              </Badge>
            ) : null}
            {isSubmitting ? (
              <Badge size="sm" variant="warning">
                {t('forms.preview.submitting')}
              </Badge>
            ) : null}
            {errorList.length > 0 ? (
              <Badge size="sm" variant="danger">
                {errorList.length}
              </Badge>
            ) : null}
          </div>
        </div>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          {open ? t('forms.preview.hide') : t('forms.preview.show')}
        </button>
      </header>

      {open ? (
        <div className="mt-3 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
              {t('forms.preview.values')}
            </p>
            <pre className="max-h-64 overflow-auto rounded-md bg-surface px-3 py-2 text-xs font-mono leading-relaxed text-foreground">
              {JSON.stringify(values, null, 2)}
            </pre>
          </div>
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-foreground-subtle">
              {t('forms.preview.errors')}
            </p>
            {errorList.length === 0 ? (
              <p className="rounded-md bg-surface px-3 py-2 text-xs font-mono text-foreground-muted">
                {t('forms.preview.empty')}
              </p>
            ) : (
              <ul className="space-y-1 rounded-md bg-surface px-3 py-2 text-xs font-mono">
                {errorList.map((e, i) => (
                  <li key={`${e.name}-${i}`}>
                    <span className="text-danger">{e.name}</span>
                    <span className="text-foreground-subtle">: </span>
                    <span className="text-foreground">{e.message}</span>
                  </li>
                ))}
              </ul>
            )}
            {extra !== undefined ? <div className="mt-3">{extra}</div> : null}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
