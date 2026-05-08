import { useState, type HTMLAttributes, type Ref } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const avatarStyles = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-medium select-none',
  {
    variants: {
      size: {
        xs: 'h-6 w-6 text-[0.625rem]',
        sm: 'h-8 w-8 text-xs',
        md: 'h-10 w-10 text-sm',
        lg: 'h-12 w-12 text-base',
        xl: 'h-16 w-16 text-lg',
      },
    },
    defaultVariants: { size: 'md' },
  },
);

const statusDotStyles = cva('absolute rounded-full ring-2 ring-background', {
  variants: {
    size: {
      xs: 'h-1.5 w-1.5 right-0 bottom-0',
      sm: 'h-2 w-2 right-0 bottom-0',
      md: 'h-2.5 w-2.5 right-0 bottom-0',
      lg: 'h-3 w-3 right-0.5 bottom-0.5',
      xl: 'h-3.5 w-3.5 right-1 bottom-1',
    },
    status: {
      online: 'bg-success',
      offline: 'bg-foreground-muted',
      busy: 'bg-danger',
      away: 'bg-warning',
    },
  },
});

const FALLBACK_PALETTE = [
  'bg-primary text-primary-foreground',
  'bg-info text-info-foreground',
  'bg-success text-success-foreground',
  'bg-warning text-warning-foreground',
  'bg-danger text-danger-foreground',
  'bg-secondary text-secondary-foreground',
] as const;

function hashName(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i += 1) {
    h = (h * 31 + name.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  const first = parts[0]![0] ?? '';
  const last = parts[parts.length - 1]![0] ?? '';
  return (first + last).toUpperCase();
}

export type AvatarStatus = 'online' | 'offline' | 'busy' | 'away';

export interface AvatarProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, 'children'>,
    VariantProps<typeof avatarStyles> {
  ref?: Ref<HTMLSpanElement>;
  src?: string;
  name?: string;
  alt?: string;
  status?: AvatarStatus;
}

export function Avatar({
  ref,
  className,
  size,
  src,
  name,
  alt,
  status,
  ...rest
}: AvatarProps) {
  const [errored, setErrored] = useState(false);
  const showImg = src !== undefined && src !== '' && !errored;
  const text = name !== undefined ? initials(name) : '';

  const colorClass =
    name !== undefined && name !== ''
      ? FALLBACK_PALETTE[hashName(name) % FALLBACK_PALETTE.length]!
      : 'bg-surface-muted text-foreground';

  const baseLabel = alt ?? name ?? 'Avatar';
  const ariaLabel = status !== undefined ? `${baseLabel}, ${status}` : baseLabel;

  return (
    <span
      ref={ref}
      role="img"
      aria-label={ariaLabel}
      className={cn(avatarStyles({ size }), !showImg && colorClass, className)}
      {...rest}
    >
      {showImg ? (
        <img
          src={src}
          alt=""
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      ) : (
        <span aria-hidden="true">{text}</span>
      )}
      {status !== undefined ? (
        <span className={statusDotStyles({ size, status })} aria-hidden="true" />
      ) : null}
    </span>
  );
}
