import { NavLink as RouterNavLink } from 'react-router-dom';
import type { ReactNode, Ref } from 'react';
import { cn } from '@/lib/cn';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/feedback/Tooltip';
import { useSidebar } from './Sidebar';

export interface NavLinkProps {
  ref?: Ref<HTMLAnchorElement>;
  to: string;
  label: string;
  icon: ReactNode;
  /** Render label inline even when sidebar is collapsed (used inside group flyout). */
  forceLabel?: boolean;
  /** Indent for accordion-group children. */
  indented?: boolean;
  /** Called after navigation; used to close transient overlays like the flyout. */
  onNavigate?: () => void;
  className?: string;
}

export function NavLink({
  ref,
  to,
  label,
  icon,
  forceLabel,
  indented,
  onNavigate,
  className,
}: NavLinkProps) {
  const { isMobile, collapsed, setMobileOpen } = useSidebar();
  const showLabel = isMobile || !collapsed || forceLabel === true;

  const link = (
    <RouterNavLink
      ref={ref}
      to={to}
      onClick={() => {
        if (isMobile) setMobileOpen(false);
        onNavigate?.();
      }}
      aria-label={!showLabel ? label : undefined}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-2.5 rounded-md py-2 text-sm transition-colors',
          showLabel ? 'px-3' : 'justify-center px-2',
          indented === true && showLabel ? 'pl-9' : null,
          isActive
            ? 'bg-surface-muted font-medium text-foreground'
            : 'text-foreground-muted hover:bg-surface-muted hover:text-foreground',
          className,
        )
      }
    >
      <span
        style={{ color: 'var(--color-primary)' }}
        className={cn('shrink-0', !showLabel && '[&>svg]:h-5 [&>svg]:w-5')}
      >
        {icon}
      </span>
      {showLabel ? <span className="truncate">{label}</span> : null}
    </RouterNavLink>
  );

  return (
    <li>
      {!showLabel ? (
        <Tooltip>
          <TooltipTrigger>{link}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {label}
          </TooltipContent>
        </Tooltip>
      ) : (
        link
      )}
    </li>
  );
}
