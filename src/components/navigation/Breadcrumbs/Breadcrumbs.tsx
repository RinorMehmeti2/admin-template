import {
  Children,
  Fragment,
  isValidElement,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react';
import { ChevronRight } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/cn';

export interface BreadcrumbsProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  ref?: Ref<HTMLElement>;
  separator?: ReactNode;
  children: ReactNode;
}

export function Breadcrumbs({
  ref,
  separator,
  children,
  className,
  ...rest
}: BreadcrumbsProps) {
  const items = Children.toArray(children).filter(isValidElement);
  const sep = separator ?? <ChevronRight className="h-3.5 w-3.5" />;
  return (
    <nav
      ref={ref}
      aria-label="Breadcrumb"
      className={cn('text-sm', className)}
      {...rest}
    >
      <ol className="flex flex-wrap items-center gap-1.5">
        {items.map((item, i) => (
          <Fragment key={i}>
            {item}
            {i < items.length - 1 ? <BreadcrumbSeparator>{sep}</BreadcrumbSeparator> : null}
          </Fragment>
        ))}
      </ol>
    </nav>
  );
}

export function BreadcrumbItem({
  ref,
  className,
  children,
  ...rest
}: HTMLAttributes<HTMLLIElement> & { ref?: Ref<HTMLLIElement> }) {
  return (
    <li ref={ref} className={cn('inline-flex items-center', className)} {...rest}>
      {children}
    </li>
  );
}

export function BreadcrumbSeparator({
  className,
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <li
      role="presentation"
      aria-hidden="true"
      className={cn('text-foreground-subtle', className)}
    >
      {children ?? <ChevronRight className="h-3.5 w-3.5" />}
    </li>
  );
}

export interface BreadcrumbLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

export function BreadcrumbLink({ to, children, className }: BreadcrumbLinkProps) {
  return (
    <NavLink
      to={to}
      className={cn(
        'rounded-sm text-foreground-muted transition-colors hover:text-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        className,
      )}
    >
      {children}
    </NavLink>
  );
}

export function BreadcrumbCurrent({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <span aria-current="page" className={cn('font-medium text-foreground', className)}>
      {children}
    </span>
  );
}
