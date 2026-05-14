import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Badge } from '@/components/primitives/Badge';
import type { SectionTone } from './SectionHeader';

// Badge currently lacks a 'secondary' variant — use neutral with a secondary
// text/border tint when the page tone is secondary.
const BADGE_VARIANT: Record<
  SectionTone,
  'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
> = {
  primary: 'primary',
  success: 'success',
  warning: 'warning',
  info: 'info',
  danger: 'danger',
  secondary: 'neutral',
};

const SECONDARY_TINT = 'bg-secondary/15 text-secondary';

const DOT: Record<SectionTone, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  info: 'bg-info',
  danger: 'bg-danger',
  secondary: 'bg-secondary',
};

export interface ChipProps {
  tone?: SectionTone;
  icon?: ReactNode;
  /** Show a leading colored dot. */
  dot?: boolean;
  size?: 'sm' | 'md';
  className?: string;
  children: ReactNode;
}

export function Chip({
  tone = 'primary',
  icon,
  dot = false,
  size = 'sm',
  className,
  children,
}: ChipProps) {
  return (
    <Badge
      variant={BADGE_VARIANT[tone]}
      size={size}
      className={cn('gap-1.5', tone === 'secondary' && SECONDARY_TINT, className)}
    >
      {dot ? (
        <span
          aria-hidden="true"
          className={cn('inline-block h-1.5 w-1.5 rounded-full', DOT[tone])}
        />
      ) : null}
      {icon !== undefined ? (
        <span aria-hidden="true" className="inline-flex">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </Badge>
  );
}
