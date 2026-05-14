import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/cn';
import { SlideInRight } from '@/components/motion';

export interface ReceiptLine {
  id: string;
  qty: number;
  name: string;
  unitPrice: number;
}

interface OrderReceiptProps {
  customer: string;
  lines: ReadonlyArray<ReceiptLine>;
  notes: string;
  className?: string;
}

const TAX_RATE = 0.08;

export function OrderReceipt({ customer, lines, notes, className }: OrderReceiptProps) {
  const { t, i18n } = useTranslation();
  const currency = useMemo(
    () => new Intl.NumberFormat(i18n.language, { style: 'currency', currency: 'USD' }),
    [i18n.language],
  );

  const subtotal = lines.reduce((sum, l) => sum + l.qty * l.unitPrice, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;
  const now = new Date();
  const time = useMemo(
    () => now.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  return (
    <div
      className={cn(
        'rounded-md border-2 border-dashed border-foreground/30 bg-surface px-4 py-4 font-mono text-xs text-foreground',
        className,
      )}
      role="region"
      aria-label={t('croissant.forms.receipt.title')}
    >
      <div className="border-b border-dashed border-foreground/30 pb-2 text-center">
        <p className="text-sm font-bold uppercase tracking-wider">{t('croissant.forms.receipt.title')}</p>
        <p className="mt-1 text-foreground-muted">{t('croissant.forms.receipt.bakery')}</p>
        <p className="text-foreground-subtle">{time}</p>
      </div>

      <p className="mt-2 truncate">
        <span className="text-foreground-muted">{t('croissant.forms.receipt.customer')}:</span>{' '}
        <span className="font-semibold">{customer.trim() === '' ? '—' : customer}</span>
      </p>

      <ul className="mt-3 space-y-1 border-b border-dashed border-foreground/30 pb-3" aria-live="polite">
        {lines.length === 0 ? (
          <li className="text-foreground-subtle">{t('croissant.forms.receipt.empty')}</li>
        ) : (
          lines.map((l) => (
            <SlideInRight key={l.id}>
              <li className="flex items-baseline gap-2">
                <span className="w-6 text-right tabular-nums">{l.qty}×</span>
                <span className="flex-1 truncate">{l.name}</span>
                <span className="tabular-nums">{currency.format(l.qty * l.unitPrice)}</span>
              </li>
            </SlideInRight>
          ))
        )}
      </ul>

      <dl className="mt-2 space-y-0.5">
        <div className="flex justify-between">
          <dt className="text-foreground-muted">{t('croissant.forms.receipt.subtotal')}</dt>
          <dd className="tabular-nums">{currency.format(subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-foreground-muted">{t('croissant.forms.receipt.tax')}</dt>
          <dd className="tabular-nums">{currency.format(tax)}</dd>
        </div>
        <div className="flex justify-between border-t border-dashed border-foreground/30 pt-1 text-sm font-bold">
          <dt>{t('croissant.forms.receipt.total')}</dt>
          <dd className="tabular-nums">{currency.format(total)}</dd>
        </div>
      </dl>

      {notes.trim() !== '' ? (
        <p className="mt-3 border-t border-dashed border-foreground/30 pt-2 text-foreground-muted">
          <span className="font-semibold">{t('croissant.forms.receipt.notes')}:</span> {notes}
        </p>
      ) : null}

      <p className="mt-3 text-center text-foreground-subtle">{t('croissant.forms.receipt.thanks')}</p>
    </div>
  );
}
