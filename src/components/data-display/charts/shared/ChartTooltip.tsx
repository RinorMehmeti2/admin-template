import type { ReactNode } from 'react';
import type { TooltipContentProps } from 'recharts';
import { cn } from '@/lib/cn';

/*
 * `TooltipContentProps` is generic in value/name types and Recharts feeds the
 * full `ValueType | NameType` superset through the content callback. We don't
 * narrow the generics here — the body only reads `active`, `payload`, `label`
 * and tolerates the broad shape, which avoids a bunch of incompatible-generic
 * errors when consumers pass `content={(props) => <ChartTooltipContent {...props} />}`.
 */
interface ChartTooltipProps extends TooltipContentProps {
  yFormatter?: ((v: number) => string) | undefined;
  xFormatter?: ((v: unknown) => string) | undefined;
}

function formatValue(value: unknown, yFormatter?: (v: number) => string): ReactNode {
  if (typeof value === 'number') return yFormatter?.(value) ?? value.toLocaleString();
  if (Array.isArray(value)) return value.map((v) => String(v)).join(', ');
  if (value === undefined || value === null) return null;
  return String(value);
}

/**
 * Tooltip body styled like our Tooltip primitive (rounded surface, shadow,
 * border, token-driven). Recharts passes payload + label through `content`.
 */
export function ChartTooltipContent({
  active,
  payload,
  label,
  yFormatter,
  xFormatter,
}: ChartTooltipProps) {
  if (active !== true || payload === undefined || payload.length === 0) return null;

  const labelText: ReactNode = xFormatter !== undefined ? xFormatter(label) : (label as ReactNode);

  return (
    <div
      className={cn(
        'pointer-events-none rounded-md border border-border bg-surface-elevated p-2.5 text-xs text-foreground shadow-md',
        'min-w-[8rem] space-y-1',
      )}
    >
      {labelText !== undefined && labelText !== null ? (
        <p className="text-[11px] font-medium uppercase tracking-wide text-foreground-subtle">
          {labelText}
        </p>
      ) : null}
      <ul className="space-y-1">
        {payload.map((entry, index) => {
          const colour = (entry.color ?? entry.fill ?? entry.stroke ?? 'currentColor') as string;
          return (
            <li key={`${entry.dataKey ?? index}`} className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: colour }}
              />
              <span className="flex-1 text-foreground-muted">
                {entry.name ?? (typeof entry.dataKey === 'string' ? entry.dataKey : '')}
              </span>
              <span className="font-medium tabular-nums text-foreground">
                {formatValue(entry.value, yFormatter)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
