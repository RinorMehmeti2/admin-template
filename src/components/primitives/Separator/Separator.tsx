import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';

const separatorStyles = cva('shrink-0 bg-border', {
  variants: {
    orientation: {
      horizontal: 'h-px w-full',
      vertical: 'w-px h-full',
    },
  },
  defaultVariants: { orientation: 'horizontal' },
});

export interface SeparatorProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof separatorStyles> {
  ref?: Ref<HTMLDivElement>;
  /** True (default) hides from assistive tech; false marks as a real separator. */
  decorative?: boolean;
}

export function Separator({
  ref,
  className,
  orientation = 'horizontal',
  decorative = true,
  ...rest
}: SeparatorProps) {
  const ariaProps = decorative
    ? { role: 'none' as const, 'aria-hidden': true as const }
    : {
        role: 'separator' as const,
        'aria-orientation': (orientation ?? 'horizontal') as 'horizontal' | 'vertical',
      };

  return (
    <div
      ref={ref}
      className={cn(separatorStyles({ orientation }), className)}
      {...rest}
      {...ariaProps}
    />
  );
}
