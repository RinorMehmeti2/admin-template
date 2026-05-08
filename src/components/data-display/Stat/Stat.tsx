import { ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';

const statStyles = cva('flex', {
  variants: {
    variant: {
      default: 'flex-col gap-2',
      compact: 'flex-row items-center gap-3',
    },
  },
  defaultVariants: { variant: 'default' },
});

export type StatDelta = number | string;

export interface StatProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statStyles> {
  ref?: Ref<HTMLDivElement>;
  label: ReactNode;
  value: ReactNode;
  delta?: StatDelta;
  deltaLabel?: ReactNode;
  icon?: ReactNode;
}

interface DeltaInfo {
  prefix: string;
  text: string;
  tone: 'up' | 'down' | 'flat';
}

function parseDelta(delta: StatDelta): DeltaInfo {
  if (typeof delta === 'number') {
    if (delta > 0) return { prefix: '+', text: String(delta), tone: 'up' };
    if (delta < 0) return { prefix: '', text: String(delta), tone: 'down' };
    return { prefix: '', text: '0', tone: 'flat' };
  }
  const trimmed = delta.trim();
  if (trimmed.startsWith('+')) return { prefix: '', text: trimmed, tone: 'up' };
  if (trimmed.startsWith('-')) return { prefix: '', text: trimmed, tone: 'down' };
  // No sign in string — treat as positive (caller chose to omit sign).
  return { prefix: '+', text: trimmed, tone: 'up' };
}

const toneStyles = {
  up: 'text-success',
  down: 'text-danger',
  flat: 'text-foreground-muted',
} as const;

const toneIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: null,
} as const;

export function Stat({
  ref,
  className,
  variant,
  label,
  value,
  delta,
  deltaLabel,
  icon,
  ...rest
}: StatProps) {
  const v = variant ?? 'default';
  const info = delta !== undefined ? parseDelta(delta) : null;
  const ToneIcon = info !== null ? toneIcon[info.tone] : null;

  if (v === 'compact') {
    return (
      <div ref={ref} className={cn(statStyles({ variant: v }), className)} {...rest}>
        {icon !== undefined ? (
          <span
            aria-hidden="true"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-muted text-foreground-muted"
          >
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-foreground-muted">{label}</p>
          <p className="truncate text-lg font-semibold leading-tight text-foreground">
            {value}
          </p>
        </div>
        {info !== null ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-sm font-medium',
              toneStyles[info.tone],
            )}
          >
            {ToneIcon !== null ? <ToneIcon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            <span>
              {info.prefix}
              {info.text}
            </span>
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn(statStyles({ variant: v }), className)} {...rest}>
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground-muted">{label}</p>
        {icon !== undefined ? (
          <span aria-hidden="true" className="text-foreground-subtle">
            {icon}
          </span>
        ) : null}
      </div>
      <div className="flex items-baseline gap-2">
        <p className="text-3xl font-semibold leading-none tracking-tight text-foreground">
          {value}
        </p>
        {info !== null ? (
          <span
            className={cn(
              'inline-flex items-center gap-0.5 text-sm font-medium',
              toneStyles[info.tone],
            )}
          >
            {ToneIcon !== null ? <ToneIcon className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            <span>
              {info.prefix}
              {info.text}
            </span>
          </span>
        ) : null}
      </div>
      {deltaLabel !== undefined ? (
        <p className="text-xs text-foreground-subtle">{deltaLabel}</p>
      ) : null}
    </div>
  );
}
