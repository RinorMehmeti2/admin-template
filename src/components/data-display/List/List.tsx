import { cva, type VariantProps } from 'class-variance-authority';
import type { HTMLAttributes, LiHTMLAttributes, ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';

const listStyles = cva('flex flex-col', {
  variants: {
    variant: {
      default: '',
      divided: 'divide-y divide-border',
    },
  },
  defaultVariants: { variant: 'default' },
});

export interface ListProps
  extends HTMLAttributes<HTMLUListElement>,
    VariantProps<typeof listStyles> {
  ref?: Ref<HTMLUListElement>;
}

export function List({ ref, className, variant, ...rest }: ListProps) {
  return (
    <ul
      ref={ref}
      className={cn(listStyles({ variant }), className)}
      {...rest}
    />
  );
}

export interface ListItemProps extends Omit<LiHTMLAttributes<HTMLLIElement>, 'title'> {
  ref?: Ref<HTMLLIElement>;
  leading?: ReactNode;
  primary: ReactNode;
  secondary?: ReactNode;
  trailing?: ReactNode;
}

export function ListItem({
  ref,
  className,
  leading,
  primary,
  secondary,
  trailing,
  ...rest
}: ListItemProps) {
  return (
    <li
      ref={ref}
      className={cn(
        'flex items-center gap-3 px-3 py-2.5',
        className,
      )}
      {...rest}
    >
      {leading !== undefined ? (
        <span className="flex shrink-0 items-center text-foreground-muted">{leading}</span>
      ) : null}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{primary}</p>
        {secondary !== undefined ? (
          <p className="truncate text-xs text-foreground-muted">{secondary}</p>
        ) : null}
      </div>
      {trailing !== undefined ? (
        <span className="flex shrink-0 items-center gap-2">{trailing}</span>
      ) : null}
    </li>
  );
}
