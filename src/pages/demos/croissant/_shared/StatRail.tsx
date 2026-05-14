import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { StatCard } from '@/components/data-display/StatCard';
import { PulseRing, Stagger } from '@/components/motion';
import type { SectionTone } from './SectionHeader';

export interface StatRailItem {
  id: string;
  label: ReactNode;
  value: number;
  /** Display string override (e.g. "$48,210"). Skips counter animation. */
  displayValue?: ReactNode;
  unit?: ReactNode;
  delta?: number;
  deltaLabel?: ReactNode;
  icon?: ReactNode;
  /** Sparkline data (5+ points). */
  spark?: number[];
  /** Tone for this card's accent. Pulse ring only shows when accent is set. */
  tone?: SectionTone;
  /** Format the value for display. */
  formatValue?: (n: number) => string;
  /** Toggle the PulseRing accent (the rail's "live" indicator card). */
  accent?: boolean;
  onClick?: () => void;
  /** Mark this stat as the currently-active filter. */
  active?: boolean;
}

const RING: Record<SectionTone, string> = {
  primary: 'ring-primary',
  success: 'ring-success',
  warning: 'ring-warning',
  info: 'ring-info',
  secondary: 'ring-secondary',
  danger: 'ring-danger',
};

export interface StatRailProps {
  items: ReadonlyArray<StatRailItem>;
  /** Stagger entry animation. Default true. */
  animate?: boolean;
  className?: string;
}

export function StatRail({ items, animate = true, className }: StatRailProps) {
  const cards = items.map((it) => {
    const card = (
      <div
        key={it.id}
        className={cn(
          'relative shrink-0 snap-start basis-[18rem] transform-gpu transition-all duration-150',
          'hover:-translate-y-0.5 hover:shadow-md',
          it.active === true &&
            `ring-2 ring-offset-2 ring-offset-background ${RING[it.tone ?? 'primary']}`,
        )}
      >
        <StatCard
          label={it.label}
          value={it.value}
          {...(it.displayValue !== undefined ? { displayValue: it.displayValue } : {})}
          {...(it.unit !== undefined ? { unit: it.unit } : {})}
          {...(it.delta !== undefined ? { delta: it.delta } : {})}
          {...(it.deltaLabel !== undefined ? { deltaLabel: it.deltaLabel } : {})}
          {...(it.icon !== undefined ? { icon: it.icon } : {})}
          {...(it.spark !== undefined ? { sparklineData: it.spark } : {})}
          {...(it.formatValue !== undefined ? { formatValue: it.formatValue } : {})}
          {...(it.onClick !== undefined ? { onClick: it.onClick } : {})}
          className="h-full"
        />
        {it.accent === true ? (
          <span
            aria-hidden="true"
            data-print="hide"
            className="pointer-events-none absolute right-3 top-3"
          >
            <PulseRing
              size="sm"
              color={
                (it.tone ?? 'primary') === 'secondary'
                  ? 'primary'
                  : ((it.tone ?? 'primary') as
                      | 'primary'
                      | 'success'
                      | 'warning'
                      | 'danger'
                      | 'info')
              }
            />
          </span>
        ) : null}
      </div>
    );
    return card;
  });

  return (
    <div
      className={cn(
        '-mx-1 overflow-x-auto px-1 pb-1',
        'snap-x snap-mandatory scroll-pl-1',
        className,
      )}
    >
      {animate ? (
        <Stagger animation="slide-in-up" stagger={50} className="flex gap-4">
          {cards}
        </Stagger>
      ) : (
        <div className="flex gap-4">{cards}</div>
      )}
    </div>
  );
}
