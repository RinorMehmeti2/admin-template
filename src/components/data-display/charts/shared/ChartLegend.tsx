import type { ReactElement } from 'react';
import { cn } from '@/lib/cn';

export interface ChartLegendItem {
  key: string;
  label: string;
  color: string;
}

export interface ChartLegendProps {
  items: ReadonlyArray<ChartLegendItem>;
  hidden: ReadonlySet<string>;
  onToggle: (key: string) => void;
  className?: string;
}

/**
 * Token-styled legend. Each pill toggles a series' visibility — hidden series
 * dim their swatch and label and gain `aria-pressed=false` for AT consumers.
 */
export function ChartLegend({
  items,
  hidden,
  onToggle,
  className,
}: ChartLegendProps): ReactElement {
  return (
    <ul
      className={cn('flex flex-wrap items-center justify-center gap-1.5 px-2 pb-1', className)}
    >
      {items.map((item) => {
        const isHidden = hidden.has(item.key);
        return (
          <li key={item.key}>
            <button
              type="button"
              aria-pressed={!isHidden}
              onClick={() => onToggle(item.key)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-medium transition-colors',
                'hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                isHidden && 'opacity-50',
              )}
            >
              <span
                aria-hidden="true"
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: isHidden ? 'transparent' : item.color, outline: isHidden ? `1px solid ${item.color}` : 'none' }}
              />
              <span className={cn('text-foreground', isHidden && 'line-through')}>
                {item.label}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
